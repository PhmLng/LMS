// ============================================================
// src/services/returnService.js
// Domain: Trả sách (Return)
// ============================================================

import axiosClient from "./axiosClient";

/**
 * Lấy danh sách sách đang mượn cần trả theo mã thẻ.
 * Endpoint: GET /return/return-items?cardCode={cardCode}
 *
 * @param {string} cardCode - Mã thẻ độc giả (VD: LIB260001)
 * @returns {Promise<object>} {
 *   success, code, message,
 *   data: [{ id, barcode, bookTitle, borrowDate, dueDate,
 *            daysOverdue, estimatedFine, status }]
 * }
 */
export const getReturnItemsApi = async (cardCode) => {
    const response = await axiosClient.get("/return/return-items", {
        params: { cardCode: cardCode.trim() },
    });
    return response.data;
};

/**
 * Xác nhận trả sách hàng loạt.
 * Endpoint: POST /return
 *
 * @param {object} payload - {
 *   returnItemDetailRequests: [{ loanDetailId: number, status: "NORMAL"|"DAMAGED"|"LOST" }]
 * }
 * @returns {Promise<object>} { success, code, message, data }
 */
export const confirmReturnApi = async (payload) => {
    const response = await axiosClient.post("/return", payload);
    return response.data;
};