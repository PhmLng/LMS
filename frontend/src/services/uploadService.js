// ============================================================
// src/services/uploadService.js
// Domain: Upload file ảnh lên Backend
// ============================================================

import axiosClient from "./axiosClient";

/**
 * Upload ảnh bìa sách lên Server.
 * Endpoint: POST /files/upload
 * Content-Type: multipart/form-data (Axios tự set khi truyền FormData)
 * Token: tự động đính kèm qua axiosClient interceptor.
 *
 * Response: { success, code, message, data: "http://localhost:8080/uploads/..." }
 * Lưu ý: data là string URL thẳng, không phải object { url }.
 *
 * @param {File}     file       - File ảnh người dùng chọn
 * @param {Function} onProgress - Callback nhận % tiến trình (0-100)
 * @returns {Promise<object>} { success, code, message, data: "https://..." }
 */
export const uploadImageApi = async (file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percent = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                onProgress(percent);
            }
        },
    });

    return response.data;
};