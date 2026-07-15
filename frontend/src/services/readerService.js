// ============================================================
// src/services/readerService.js
// Domain: Độc giả (Readers)
// ============================================================

import axiosClient from "./axiosClient";

/**
 * Lấy danh sách độc giả có phân trang và lọc theo trạng thái.
 * Endpoint: GET /readers?page={page}&size={size}&cardStatus={status}&fullName={name}
 *
 * Lưu ý: BE dùng 0-indexed → trừ 1 khi gửi page.
 * cardStatus "ALL" → không truyền param (BE lấy tất cả).
 *
 * @param {number}           page     - Trang FE (1-indexed)
 * @param {number}           size     - Số bản ghi mỗi trang
 * @param {string|undefined} status   - ACTIVE | LOCKED | EXPIRED | ALL
 * @param {string|undefined} fullName - Từ khóa tìm kiếm họ tên
 * @returns {Promise<object>} { success, code, message, data: { content, totalElements, ... } }
 */
export const getReadersApi = async (page = 1, size = 10, status, fullName) => {
    const params = { page: page - 1, size };
    if (status && status !== "ALL") params.cardStatus = status;
    if (fullName && fullName.trim()) params.fullName = fullName.trim();

    const response = await axiosClient.get("/readers", { params });
    return response.data;
};

/**
 * Lấy chi tiết 1 độc giả theo ID (đầy đủ: gender, dateOfBirth, libraryCardResponse...).
 * Endpoint: GET /readers/{id}
 *
 * @param {number|string} id - ID của độc giả
 * @returns {Promise<object>} { success, code, message, data: { fullName, email, phoneNumber,
 *   address, gender, dateOfBirth, libraryCardResponse, accountResponse } }
 */
export const getReaderByIdApi = async (id) => {
    const response = await axiosClient.get(`/readers/${id}`);
    return response.data;
};

/**
 * Thêm độc giả mới (tạo tài khoản + thẻ + thông tin cá nhân).
 * Endpoint: POST /readers
 * Body: { accountRequest, libraryCardRequest, readerRequest }
 */
export const createReaderApi = async (payload) => {
    const response = await axiosClient.post("/readers", payload);
    return response.data;
};

/**
 * Cập nhật thông tin độc giả.
 * Endpoint: PUT /readers/{id}
 * Body: { libraryCardRequest, readerRequest }
 */
export const updateReaderApi = async (id, payload) => {
    const response = await axiosClient.put(`/readers/${id}`, payload);
    return response.data;
};

/**
 * Khóa tài khoản độc giả.
 * Endpoint: PUT /readers/{id}/lock
 */
export const lockReaderApi = async (id) => {
    const response = await axiosClient.put(`/readers/${id}/lock`);
    return response.data;
};

/**
 * Mở khóa tài khoản độc giả.
 * Endpoint: PUT /readers/{id}/unlock
 */
export const unlockReaderApi = async (id) => {
    const response = await axiosClient.put(`/readers/${id}/unlock`);
    return response.data;
};