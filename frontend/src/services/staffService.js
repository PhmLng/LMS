// ============================================================
// src/services/staffService.js
// Domain: Nhân sự (Staffs)
// ============================================================

import axiosClient from "./axiosClient";

/**
 * Lấy danh sách nhân sự có phân trang và lọc theo role.
 * Endpoint: GET /staffs?page=&size=&role=
 *
 * Lưu ý: BE dùng 0-indexed → trừ 1 khi gửi page.
 * role "ALL" → không truyền param.
 *
 * @param {number}           page  - Trang FE (1-indexed)
 * @param {number}           size  - Số bản ghi mỗi trang
 * @param {string|undefined} role  - ADMIN | LIBRARIAN | ALL
 * @returns {Promise<object>} {
 *   success, code, message,
 *   data: { content[], totalElements, totalPages, size, number }
 * }
 */
export const getStaffsApi = async (page = 1, size = 10, role) => {
    const params = { page: page - 1, size };
    if (role && role !== "ALL") params.role = role;

    const response = await axiosClient.get("/staffs", { params });
    return response.data;
};

/**
 * Tìm kiếm nhân sự theo tên.
 * Endpoint: GET /staffs/search?name={name}
 *
 * @param {string} name - Từ khóa tìm kiếm theo tên
 * @returns {Promise<object>} { success, code, message, data: [] }
 */
export const searchStaffsApi = async (name) => {
    const response = await axiosClient.get("/staffs/search", {
        params: { name: name.trim() },
    });
    return response.data;
};

/**
 * Tạo tài khoản nhân sự mới.
 * Endpoint: POST /staffs
 *
 * @param {object} payload - {
 *   accountRequest: { fullname, username, password, roles: string[] },
 *   staffRequest:   { fullName, email, phoneNumber }
 * }
 * @returns {Promise<object>} { success, code, message, data }
 */
export const createStaffApi = async (payload) => {
    const response = await axiosClient.post("/staffs", payload);
    return response.data;
};

/**
 * Cập nhật thông tin nhân sự.
 * Endpoint: PUT /staffs/{id}
 *
 * @param {number} id      - ID nhân sự cần cập nhật
 * @param {object} payload - { fullName, email, phoneNumber, roles: string[] }
 * @returns {Promise<object>} { success, code, message, data }
 */
export const updateStaffApi = async (id, payload) => {
    const response = await axiosClient.put(`/staffs/${id}`, payload);
    return response.data;
};

/**
 * Khóa tài khoản nhân sự.
 * Endpoint: PUT /staffs/{id}/lock
 *
 * @param {number} id - ID nhân sự cần khóa
 * @returns {Promise<object>} { success, code, message, data }
 */
export const lockStaffApi = async (id) => {
    const response = await axiosClient.put(`/staffs/${id}/lock`);
    return response.data;
};

/**
 * Mở khóa tài khoản nhân sự.
 * Endpoint: PUT /staffs/{id}/unlock
 *
 * @param {number} id - ID nhân sự cần mở khóa
 * @returns {Promise<object>} { success, code, message, data }
 */
export const unlockStaffApi = async (id) => {
    const response = await axiosClient.put(`/staffs/${id}/unlock`);
    return response.data;
};