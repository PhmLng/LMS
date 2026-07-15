// ============================================================
// src/services/publisherService.js
// Domain: Nhà xuất bản
// ============================================================

import axiosClient from "./axiosClient";

/**
 * Lấy danh sách NXB có phân trang và tìm kiếm theo tên.
 * BE đã cấu hình one-indexed → truyền thẳng page FE, không trừ 1.
 * Endpoint: GET /publishers?page={page}&size={size}&search={search}
 */
export const getPublishersApi = async (page = 1, size = 10, name) => {
    const response = await axiosClient.get("/publishers", {
        params: {
            page,
            size,
            name: name || undefined,
        },
    });
    return response.data;
};

/**
 * Thêm NXB mới.
 * Endpoint: POST /publishers
 * Body: { name, description }
 */
export const createPublisherApi = async (payload) => {
    const response = await axiosClient.post("/publishers", payload);
    return response.data;
};

/**
 * Cập nhật NXB.
 * Endpoint: PUT /publishers/{id}
 * Body: { name, description }
 */
export const updatePublisherApi = async (id, payload) => {
    const response = await axiosClient.put(`/publishers/${id}`, payload);
    return response.data;
};

/**
 * Xóa NXB.
 * Endpoint: DELETE /publishers/{id}
 * BE trả 200/204, không có body — không check success.
 */
export const deletePublisherApi = async (id) => {
    const response = await axiosClient.delete(`/publishers/${id}`);
    return response.data;
};