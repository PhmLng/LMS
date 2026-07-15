// ============================================================
// src/services/authService.js
// Layer Service: Xác thực người dùng (Login / Logout).
// ============================================================

import axios from "axios";
import axiosClient from "./axiosClient";

const BASE_URL = "http://localhost:8080/api/v1";

/**
 * Đăng nhập — dùng axios GỐC (chưa có token khi login).
 * Lưu accessToken, refreshToken, user vào localStorage sau khi thành công.
 */
export const loginApi = async (username, password) => {
    const response = await axios.post(
        `${BASE_URL}/auth/login`,
        { username, password },
        { headers: { "Content-Type": "application/json" } }
    );
    const result = response.data;

    if (result.success && result.data) {
        const { accessToken, refreshToken, accountInfor } = result.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(accountInfor));
    }

    return result;
};

/**
 * Đăng xuất — gọi API Backend để vô hiệu hóa token server-side,
 * sau đó dọn dẹp localStorage dù API thành công hay thất bại.
 *
 * Dùng axiosClient (có interceptor) vì đây là protected endpoint.
 * Trả về { success, apiCalled } để Header biết trạng thái.
 */
export const logoutApi = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    // Hàm dọn dẹp nội bộ — luôn chạy dù API thành công hay lỗi
    const clearSession = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
    };

    try {
        await axiosClient.post("/auth/logout", { accessToken, refreshToken });
        clearSession();
        return { success: true };
    } catch {
        // Graceful fallback: token đã hết hạn / server lỗi
        // → vẫn xóa localStorage để user không bị kẹt màn hình
        clearSession();
        return { success: false };
    }
};