// ============================================================
// src/services/categoryService.js
// Domain: Thể loại sách
// ============================================================

import axiosClient from "./axiosClient";

/**
 * Lấy danh sách thể loại có phân trang và tìm kiếm theo tên.
 * BE đã cấu hình one-indexed → truyền thẳng page FE, không trừ 1.
 * Endpoint: GET /categories?page={page}&size={size}&name={name}
 */
export const getCategoriesApi = async (page = 1, size = 10, name) => {
    const response = await axiosClient.get("/categories", {
        params: { page, size, name: name || undefined },
    });
    return response.data;
};

/**
 * Thêm thể loại mới.
 * Endpoint: POST /categories
 * Body: { name, description }
 */
export const createCategoryApi = async (payload) => {
    const response = await axiosClient.post("/categories", payload);
    return response.data;
};

/**
 * Cập nhật thể loại.
 * Endpoint: PUT /categories/{id}
 * Body: { name, description }
 */
export const updateCategoryApi = async (id, payload) => {
    const response = await axiosClient.put(`/categories/${id}`, payload);
    return response.data;
};

/**
 * Xóa thể loại.
 * Endpoint: DELETE /categories/{id}
 */
export const deleteCategoryApi = async (id) => {
    const response = await axiosClient.delete(`/categories/${id}`);
    return response.data;
};