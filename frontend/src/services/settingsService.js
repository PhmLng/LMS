// ============================================================
// src/services/settingsService.js
// Domain: Cấu hình hệ thống (Settings)
// ============================================================

import axiosClient from "./axiosClient";

/**
 * Lấy toàn bộ cấu hình hệ thống.
 * Endpoint: GET /settings?page=0&size=50
 *
 * Dùng size=50 để lấy hết 1 lần, tránh phân trang nhiều lần.
 *
 * @returns {Promise<object>} {
 *   success, code, message,
 *   data: { content: [{ id, settingKey, settingValue, description, updatedAt }] }
 * }
 */
export const getSettingsApi = async () => {
    const response = await axiosClient.get("/settings", {
        params: { page: 0, size: 50 },
    });
    return response.data;
};

/**
 * Cập nhật hàng loạt các cấu hình hệ thống.
 * Endpoint: PUT /settings
 *
 * @param {Array<{ settingKey: string, settingValue: string }>} payload
 * @returns {Promise<object>} { success, code, message, data }
 */
export const updateSettingsApi = async (payload) => {
    const response = await axiosClient.put("/settings", payload);
    return response.data;
};