// ============================================================
// src/services/authorService.js
// Domain: Tác giả
// ============================================================

import axiosClient from "./axiosClient";

/**
 * Lấy danh sách tác giả có phân trang.
 * Endpoint: GET /authors?page={page}&size={size}
 * BE đã cấu hình one-indexed → truyền thẳng số trang FE, không trừ 1.
 *
 * @param {number} page - Trang hiện tại (1-indexed)
 * @param {number} size - Số bản ghi mỗi trang
 * @returns {Promise<object>} { success, code, message, data: { content, totalElements, ... } }
 */
export const getAuthorsApi = async (page = 1, size = 10, name) => {
    const response = await axiosClient.get("/authors", {
        params: {
            page,
            size,
            name: name || undefined, // undefined → Axios tự bỏ khỏi query string
        },
    });
    return response.data;
};

/**
 * Thêm tác giả mới.
 * Endpoint: POST /authors
 *
 * @param {{ name: string, description: string }} payload
 * @returns {Promise<object>} { success, code, message, data }
 */
export const createAuthorApi = async (payload) => {
    const response = await axiosClient.post("/authors", payload);
    return response.data;
};

/**
 * Cập nhật thông tin tác giả.
 * Endpoint: PUT /authors/{id}
 *
 * @param {number} id
 * @param {{ name: string, description: string }} payload
 * @returns {Promise<object>} { success, code, message, data }
 */
export const updateAuthorApi = async (id, payload) => {
    const response = await axiosClient.put(`/authors/${id}`, payload);
    return response.data;
};

/**
 * Xóa tác giả.
 * Endpoint: DELETE /authors/{id}
 * BE trả 200/204, không có body — không check success.
 *
 * @param {number} id
 */
export const deleteAuthorApi = async (id) => {
    const response = await axiosClient.delete(`/authors/${id}`);
    return response.data;
};