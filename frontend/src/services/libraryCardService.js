// ============================================================
// src/services/libraryCardService.js
// Domain: Thẻ thư viện (Library Cards)
// ============================================================

import axiosClient from "./axiosClient";

/**
 * Tìm kiếm thẻ thư viện theo mã thẻ.
 * Endpoint: GET /library-cards/search?cardCode={cardCode}
 *
 * @param {string} cardCode - Mã thẻ cần tìm (VD: LIB260001)
 * @returns {Promise<object>} {
 *   success, code, message,
 *   data: { id, cardCode, readerName, status, issueDate, expiryDate }
 * }
 */
export const searchLibraryCardApi = async (cardCode) => {
    const response = await axiosClient.get("/library-cards/search", {
        params: { cardCode: cardCode.trim() },
    });
    return response.data;
};