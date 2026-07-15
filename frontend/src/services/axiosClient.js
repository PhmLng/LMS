// ============================================================
// src/services/axiosClient.js
// Axios Instance trung tâm — xử lý Auth, Auto Refresh Token,
// và Queue các request bị 401 trong khi đang refresh.
// ============================================================

import axios from "axios";

const BASE_URL = "http://localhost:8080/api/v1";

// ── 1. Khởi tạo Axios Instance ────────────────────────────────
const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// ── Biến quản lý trạng thái refresh ──────────────────────────

/**
 * Cờ ngăn nhiều request đồng thời đều gọi /auth/refresh.
 * true  → đang có 1 request refresh đang chạy, các request khác phải xếp hàng.
 * false → không có refresh nào đang chạy.
 */
let isRefreshing = false;

/**
 * Hàng đợi chứa các request bị 401 trong khi đang refresh token.
 * Mỗi phần tử: { resolve, reject }
 *   - resolve(newToken) → request được retry với token mới
 *   - reject(err)       → request bị huỷ nếu refresh thất bại
 */
let failedQueue = [];

/**
 * Xử lý toàn bộ hàng đợi sau khi refresh xong.
 * @param {Error|null} error    - null nếu refresh thành công, Error nếu thất bại
 * @param {string|null} token   - accessToken mới (hoặc null nếu thất bại)
 */
const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    failedQueue = []; // Dọn sạch hàng đợi
};

/**
 * Xoá toàn bộ dữ liệu phiên và chuyển hướng về /login.
 * Dùng window.location thay vì react-router để hoạt động
 * được ngoài component tree (trong interceptor).
 */
const forceLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
};

// ── 2. Request Interceptor — Đính kèm Access Token ───────────
axiosClient.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── 3. Response Interceptor — Bẫy lỗi 401 & Auto Refresh ─────
axiosClient.interceptors.response.use(
    // ── Thành công: trả thẳng response về cho service layer ──
    (response) => response,

    // ── Thất bại: phân luồng xử lý lỗi ──
    async (error) => {
        const originalRequest = error.config;

        // Chỉ xử lý lỗi 401 và chỉ thử refresh 1 lần (_retry flag)
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // Trường hợp chính request /auth/refresh bị 401
        // → refresh token cũng hết hạn → logout luôn, không retry
        if (originalRequest.url?.includes("/auth/refresh")) {
            forceLogout();
            return Promise.reject(error);
        }

        // Nếu đang có request refresh khác đang chạy
        // → đưa request hiện tại vào hàng đợi, chờ token mới
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: (newToken) => {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        resolve(axiosClient(originalRequest));
                    },
                    reject: (err) => reject(err),
                });
            });
        }

        // ── Đây là request 401 đầu tiên → bắt đầu refresh ──
        originalRequest._retry = true; // Đánh dấu đã retry để không loop
        isRefreshing = true;

        const refreshToken = localStorage.getItem("refreshToken");

        // Không có refresh token → logout ngay
        if (!refreshToken) {
            isRefreshing = false;
            processQueue(new Error("No refresh token"), null);
            forceLogout();
            return Promise.reject(error);
        }

        try {
            // Dùng axios GỐC (không qua axiosClient) để tránh vòng lặp vô hạn:
            // axiosClient → 401 → interceptor → axiosClient → 401 → ...
            const { data } = await axios.post(
                `${BASE_URL}/auth/refresh`,
                { token: refreshToken },
                { headers: { "Content-Type": "application/json" } }
            );

            if (!data.success) {
                throw new Error(data.message || "Refresh token không hợp lệ.");
            }

            const newAccessToken = data.data.accessToken;
            const newRefreshToken = data.data.refreshToken;

            // Lưu cặp token mới vào localStorage
            localStorage.setItem("accessToken", newAccessToken);
            localStorage.setItem("refreshToken", newRefreshToken);

            // Cập nhật header mặc định cho các request tiếp theo
            axiosClient.defaults.headers.common["Authorization"] =
                `Bearer ${newAccessToken}`;

            // Xử lý hàng đợi — retry tất cả các request đang chờ
            processQueue(null, newAccessToken);

            // Retry chính request gốc vừa bị 401
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosClient(originalRequest);

        } catch (refreshError) {
            // Refresh thất bại → thông báo cho hàng đợi và logout
            processQueue(refreshError, null);
            forceLogout();
            return Promise.reject(refreshError);

        } finally {
            isRefreshing = false; // Luôn reset cờ dù thành công hay thất bại
        }
    }
);

export default axiosClient;