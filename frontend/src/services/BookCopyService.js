// ============================================================
// src/services/bookCopyService.js
// Domain: Ấn bản vật lý (Book Copies / Instances)
// ============================================================

import axiosClient from "./axiosClient";

/**
 * Lấy danh sách ấn bản (phân trang + lọc).
 * Endpoint: GET /book-copies?bookId=&status=&page=&size=
 * BE 0-indexed → trừ 1 khi gửi page.
 */
export const getBookCopiesApi = async ({
    page = 1,
    size = 6,
    bookId,
    status,
} = {}) => {
    const response = await axiosClient.get("/book-copies", {
        params: {
            page: page,
            size,
            bookId: bookId || undefined,
            status: status || undefined,
        },
    });
    return response.data;
};

/**
 * Tìm kiếm ấn bản theo barcode.
 * Endpoint: GET /book-copies/search?barcode=
 * ⚠ Backend chỉ nhận duy nhất param `barcode`.
 */
export const searchBookCopiesApi = async (barcode) => {
    const response = await axiosClient.get("/book-copies/search", {
        params: { barcode: barcode || undefined },
    });
    return response.data;
};

/**
 * Thêm ấn bản mới.
 * Endpoint: POST /book-copies
 * Body: { barcode, location: { area, shelf, row }, status, bookId }
 */
export const createBookCopyApi = async (payload) => {
    const response = await axiosClient.post("/book-copies", payload);
    return response.data;
};

/**
 * Cập nhật ấn bản (không có barcode theo spec API).
 * Endpoint: PUT /book-copies/{id}
 * Body: { location: { area, shelf, row }, status, bookId }
 */
export const updateBookCopyApi = async (copyId, payload) => {
    const response = await axiosClient.put(`/book-copies/${copyId}`, payload);
    return response.data;
};

/**
 * Xóa ấn bản.
 * Endpoint: DELETE /book-copies/{id}
 */
export const deleteBookCopyApi = async (copyId) => {
    const response = await axiosClient.delete(`/book-copies/${copyId}`);
    return response.data;
};