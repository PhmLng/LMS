// ============================================================
// src/components/ProtectedRoute/index.jsx
// Lớp bảo vệ tuyến đường dành cho khu vực /admin.
//
// Logic kiểm tra:
//   1. Đọc "user" từ localStorage.
//   2. Nếu chưa đăng nhập (không có user) → redirect về "/login".
//   3. Nếu đã đăng nhập nhưng không có role ADMIN hoặc THU_THU → redirect về "/".
//   4. Nếu hợp lệ → render <Outlet /> (các tuyến con của /admin).
// ============================================================

import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * Các role được phép truy cập khu vực /admin.
 * Thêm hoặc bớt role tại đây khi yêu cầu thay đổi.
 */
const ADMIN_ROLES = ["ADMIN", "LIBRARIAN"];

/**
 * Đọc và parse object "user" từ localStorage.
 * Trả về null nếu không tồn tại hoặc JSON không hợp lệ.
 * @returns {object|null}
 */
const getUserFromStorage = () => {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

/**
 * Kiểm tra xem user có bất kỳ role nào trong danh sách cho phép không.
 * @param {object} user - accountInfor từ localStorage
 * @param {string[]} allowedRoles - Mảng tên role được phép
 * @returns {boolean}
 */
const hasRequiredRole = (user, allowedRoles) => {
    if (!user?.roles || !Array.isArray(user.roles)) return false;
    // user.roles là mảng object: [{ name: "ADMIN" }, ...]
    return user.roles.some((role) => allowedRoles.includes(role.name));
};

/**
 * ProtectedRoute Component.
 * Bọc các tuyến /admin/* trong App.jsx:
 *
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/admin/dashboard" element={<Dashboard />} />
 * </Route>
 */
const ProtectedRoute = () => {
    const user = getUserFromStorage();

    // Chưa đăng nhập → về trang login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Đã đăng nhập nhưng không đủ quyền → về trang chủ
    if (!hasRequiredRole(user, ADMIN_ROLES)) {
        return <Navigate to="/" replace />;
    }

    // Hợp lệ → render các tuyến con
    return <Outlet />;
};

export default ProtectedRoute;