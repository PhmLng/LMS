// ============================================================
// src/components/Header/index.jsx
// Thanh điều hướng chính — Dropdown Avatar với Logout API.
//
// Trạng thái hiển thị:
//   A. Chưa đăng nhập → nút [Đăng nhập]
//   B. Đã đăng nhập   → Dropdown fullname + menu phân quyền
//      - ADMIN / THU_THU: hiện thêm [Trang quản trị]
//      - USER: Sách đang mượn, Đóng tiền phạt, Đăng xuất
// ============================================================

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown, Avatar, Button, message } from "antd";
import {
    BookOutlined,
    DollarOutlined,
    LogoutOutlined,
    DownOutlined,
    SettingOutlined,
    LoadingOutlined,
} from "@ant-design/icons";
import { logoutApi } from "../../services/authService";
import "./Header.css";

const PRIVILEGED_ROLES = ["ADMIN", "LIBRARIAN"];

/** "Hoàng Văn A" → "HV" */
const getInitials = (fullname = "") => {
    const parts = fullname.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * @param {object|null} user     - accountInfor từ localStorage
 * @param {function}    onLogout - Callback reset state ở App.jsx
 */
const AppHeader = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    // Loading state riêng cho nút Đăng xuất — tránh block toàn Header
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const isPrivileged =
        user?.roles?.some((r) => PRIVILEGED_ROLES.includes(r.name)) ?? false;

    // ── Xử lý Đăng xuất ─────────────────────────────────────────
    const handleLogout = async () => {
        // Ngăn double-click trong khi đang xử lý
        if (isLoggingOut) return;

        setIsLoggingOut(true);

        // Hiển thị toast loading — trả về hàm destroy để đóng thủ công
        const hideLoading = messageApi.loading("Đang đăng xuất...", 0);

        try {
            // Gọi API Backend để vô hiệu hóa token server-side.
            // logoutApi() đã bọc try/catch nội bộ và luôn xóa localStorage,
            // nên dù thành công hay thất bại user vẫn được đăng xuất.
            const result = await logoutApi();

            hideLoading(); // Đóng toast loading

            if (result.success) {
                messageApi.success("Đăng xuất thành công!", 1.5);
            }
            // Nếu API lỗi → logoutApi trả { success: false } nhưng đã xóa localStorage
            // → tiếp tục redirect bình thường, không cần báo lỗi cho user

        } catch {
            // Safety net: logoutApi không throw nhưng phòng trường hợp ngoài ý muốn
            hideLoading();
        } finally {
            setIsLoggingOut(false);

            // Bước cuối — luôn chạy:
            // 1. Reset user state ở App.jsx → Header re-render về trạng thái chưa login
            // 2. Điều hướng về /login
            onLogout();
            navigate("/login");
        }
    };

    // ── Menu items Dropdown ──────────────────────────────────────
    const menuItems = [
        {
            key: "borrowed",
            icon: <BookOutlined />,
            label: "Sách đang mượn",
            onClick: () => navigate("/borrowed"),
        },
        {
            key: "fine",
            icon: <DollarOutlined />,
            label: "Đóng tiền phạt",
            onClick: () => navigate("/fine"),
        },

        // Chỉ hiện với ADMIN / THU_THU
        ...(isPrivileged
            ? [
                { type: "divider" },
                {
                    key: "admin",
                    icon: <SettingOutlined />,
                    label: "Trang quản trị",
                    onClick: () => navigate("/admin/dashboard"),
                    className: "menu-admin-item",
                },
            ]
            : []),

        { type: "divider" },
        {
            key: "logout",
            // Icon đổi sang LoadingOutlined khi đang gọi API logout
            icon: isLoggingOut ? <LoadingOutlined spin /> : <LogoutOutlined />,
            label: isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất",
            danger: true,
            disabled: isLoggingOut,
            onClick: handleLogout,
        },
    ];

    // ── Render ───────────────────────────────────────────────────
    return (
        <>
            {/* contextHolder phải nằm trong JSX để message hiển thị đúng */}
            {contextHolder}

            <header className="app-header">
                {/* Logo + Nav */}
                <div className="header-left">
                    <Link to="/" className="header-logo-box" aria-label="Trang chủ" />
                    <nav className="header-nav">
                        <Link to="/" className="nav-link">Trang chủ</Link>
                        <Link to="/search" className="nav-link">Tra cứu</Link>
                        <Link to="/about" className="nav-link">Giới thiệu</Link>
                    </nav>
                </div>

                {/* User area */}
                <div className="header-right">
                    {user ? (
                        <Dropdown
                            menu={{ items: menuItems }}
                            trigger={["click"]}
                            placement="bottomRight"
                            overlayClassName="user-dropdown-overlay"
                            // Đóng dropdown khi đang logout để tránh click lại
                            open={isLoggingOut ? false : undefined}
                        >
                            <button
                                className="user-trigger"
                                aria-label="Menu người dùng"
                                disabled={isLoggingOut}
                            >
                                <Avatar className="user-avatar">
                                    {getInitials(user.fullname)}
                                </Avatar>
                                <span className="user-fullname">{user.fullname}</span>
                                {isLoggingOut
                                    ? <LoadingOutlined className="user-caret" spin />
                                    : <DownOutlined className="user-caret" />}
                            </button>
                        </Dropdown>
                    ) : (
                        <Button
                            type="primary"
                            className="btn-login-header"
                            onClick={() => navigate("/login")}
                        >
                            Đăng nhập
                        </Button>
                    )}
                </div>
            </header>
        </>
    );
};

export default AppHeader;