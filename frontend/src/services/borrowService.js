// ============================================================
// src/services/borrowService.js
// Domain: Phiếu mượn sách (Loan Slips)
// ============================================================

import axiosClient from "./axiosClient";

/**
 * Lấy danh sách phiếu mượn có phân trang và lọc.
 * Endpoint: GET /loan-slips
 *
 * Lưu ý: BE dùng 0-indexed → trừ 1 khi gửi page.
 * status "ALL" → không truyền param (BE lấy tất cả).
 *
 * @param {number}           page      - Trang FE (1-indexed)
 * @param {number}           size      - Số bản ghi mỗi trang
 * @param {string|undefined} status    - BORROWING | OVERDUE | COMPLETED | PARTIALLY_RETURN | LOST | ALL
 * @param {string|undefined} cardCode  - Mã thẻ độc giả (tìm kiếm)
 * @returns {Promise<object>} { success, code, message, data: { content, totalElements, ... } }
 */
export const getLoanSlipsApi = async (page = 1, size = 10, status, cardCode) => {
    const params = { page: page - 1, size };
    if (status && status !== "ALL") params.status = status;
    if (cardCode && cardCode.trim()) params.cardCode = cardCode.trim();

    const response = await axiosClient.get("/loan-slips", { params });
    return response.data;
};

/**
 * Tạo phiếu mượn mới.
 * Endpoint: POST /loan-slips
 *
 * @param {object} payload - { libraryCardCode, dueDate, barcodes: string[] }
 * @returns {Promise<object>} { success, code, message, data }
 */
export const createLoanSlipApi = async (payload) => {
    const response = await axiosClient.post("/loan-slips", payload);
    return response.data;
};