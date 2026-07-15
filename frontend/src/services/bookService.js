// ============================================================
// src/api/bookService.js
// Domain: Sách — Search, Create
// ============================================================

import axiosClient from "../services/axiosClient";

/**
 * Tìm kiếm / lấy danh sách sách có phân trang và lọc.
 * Endpoint: GET /books/search
 *
 * Axios tự bỏ param có giá trị `undefined` khỏi query string
 * → Backend không nhận tham số thừa, điều kiện SQL chạy đúng.
 *
 * @param {object} options
 * @param {number}           options.page       - Trang hiện tại (one-indexed)
 * @param {number}           options.size       - Số phần tử mỗi trang
 * @param {string|undefined} options.title      - Từ khóa tìm kiếm
 * @param {number|undefined} options.categoryId - ID thể loại
 * @param {string|undefined} options.status     - AVAILABLE | OUT_OF_STOCK | DISCONTINUED
 * @returns {Promise<object>} { success, code, message, data: { content, totalElements, ... } }
 */
export const searchBooksApi = async ({
    page = 1,
    size = 6,
    title,
    categoryId,
    status,
} = {}) => {
    const response = await axiosClient.get("/books/search", {
        params: {
            page,
            size,
            title: title || undefined,
            categoryId: categoryId || undefined,
            status: status || undefined,
        },
    });
    return response.data;
};

/**
 * Tạo sách mới.
 * Endpoint: POST /books
 *
 * @param {object} bookData - { title, isbn, imageUrl, publishYear,
 *                             status, authorId, publisherId, categoryIds }
 * @returns {Promise<object>} { success, code, message, data }
 */
export const createBookApi = async (bookData) => {
    const response = await axiosClient.post("/books", bookData);
    return response.data;
};

/**
 * Lấy chi tiết 1 sách theo ID (dùng để điền vào form Sửa).
 * Endpoint: GET /books/:id
 *
 * Lưu ý: Response.data trả về object lồng nhau:
 *   author: { id, name }  →  cần map sang authorId
 *   publisher: { id, name } → cần map sang publisherId
 *   categories: [{ id, name }] → cần map sang categoryIds
 *
 * @param {number} id - ID sách
 * @returns {Promise<object>} { success, code, message, data }
 */
export const getBookByIdApi = async (id) => {
    const response = await axiosClient.get(`/books/${id}`);
    return response.data;
};

/**
 * Cập nhật thông tin sách.
 * Endpoint: PUT /books/:id
 *
 * @param {number} id       - ID sách cần cập nhật
 * @param {object} bookData - { title, isbn, imageUrl, publishYear,
 *                             status, authorId, publisherId, categoryIds }
 * @returns {Promise<object>} { success, code, message, data }
 */
export const updateBookApi = async (id, bookData) => {
    const response = await axiosClient.put(`/books/${id}`, bookData);
    return response.data;
};

/**
 * Xóa sách theo ID.
 * Endpoint: DELETE /books/:id
 *
 * @param {number} id - ID sách cần xóa
 * @returns {Promise<object>} { success, code, message, data }
 */
export const deleteBookApi = async (id) => {
    const response = await axiosClient.delete(`/books/${id}`);
    return response.data;
};