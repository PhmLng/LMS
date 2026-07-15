// ============================================================
// src/services/fineService.js
// Domain: Phạt nợ (Fines)
// ============================================================

import axiosClient from "./axiosClient";

/**
 * Lấy danh sách phiếu phạt có phân trang và lọc.
 * Endpoint: GET /fines?page=&size=&cardCode=&status=
 *
 * Lưu ý: BE dùng 0-indexed → trừ 1 khi gửi page.
 * status "ALL" → không truyền param (BE lấy tất cả).
 *
 * @param {number}           page      - Trang FE (1-indexed)
 * @param {number}           size      - Số bản ghi mỗi trang
 * @param {string|undefined} status    - PENDING | PAID | ALL
 * @param {string|undefined} cardCode  - Mã thẻ độc giả (tìm kiếm)
 * @returns {Promise<object>} {
 *   success, code, message,
 *   data: { content[], totalElements, totalPages, size, number }
 * }
 */
export const getFinesApi = async (page = 1, size = 10, status, cardCode) => {
    const params = { page: page - 1, size };
    if (status && status !== "ALL") params.status = status;
    if (cardCode && cardCode.trim()) params.cardCode = cardCode.trim();

    const response = await axiosClient.get("/fines", { params });
    return response.data;
};

/**
 * Xác nhận thanh toán tiền mặt các khoản phạt được chọn.
 * Endpoint: POST /payments/collect-cash/{readerId}
 *
 * @param {number} readerId - ID của độc giả (lấy từ trường readerId trong FineResponse)
 * @param {object} payload  - { fineIds: number[], paymentMethod: "CASH_PAYMENT" }
 * @returns {Promise<object>} { success, code, message, data }
 */
export const collectCashApi = async (readerId, payload) => {
    const response = await axiosClient.post(
        `/payments/collect-cash/${readerId}`,
        payload
    );
    return response.data;
};