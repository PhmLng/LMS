// ============================================================
// src/components/AdminLayout/Index.jsx
// Khung Layout khu vực Admin.
//
// Cấu trúc:
//   <Layout>
//     <Sider>   ← Sidebar cố định bên trái (260px)
//       Logo
//       Menu (nhóm HỆ THỐNG + QUẢN LÝ)
//       Footer (Avatar user + nút Logout)
//     </Sider>
//     <Layout>
//       <Content> ← <Outlet /> chứa các trang con
// ============================================================

import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Avatar, Tooltip, message } from "antd";
import {
    AppstoreOutlined,
    BookOutlined,
    TagsOutlined,
    UserOutlined,
    SwapOutlined,
    DollarOutlined,
    BarChartOutlined,
    SettingOutlined,
    LogoutOutlined,
    BankOutlined,
    TeamOutlined,
    EditOutlined,
    ShopOutlined,
    ImportOutlined,
    ExportOutlined,
    IdcardOutlined,
} from "@ant-design/icons";
import { logoutApi } from "../../services/authService";
import "./AdminLayout.css";

const { Sider, Content } = Layout;

// ── Helper đọc user từ localStorage ──────────────────────────
const getUserFromStorage = () => {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

// ── Helper kiểm tra role ADMIN ────────────────────────────────
const isAdminRole = (user) =>
    Array.isArray(user?.roles) &&
    user.roles.some((r) => r.name === "ADMIN");

// ── Cấu hình Menu items ──────────────────────────────────────
const buildMenuItems = (navigate, isAdminUser) => [
    // ── Nhóm HỆ THỐNG ──
    {
        type: "group",
        label: "HỆ THỐNG",
        children: [
            {
                key: "/admin/dashboard",
                icon: <AppstoreOutlined />,
                label: "Tổng quan",
                onClick: () => navigate("/admin/dashboard"),
            },
        ],
    },

    // ── Nhóm QUẢN LÝ ──
    {
        type: "group",
        label: "QUẢN LÝ",
        children: [
            {
                key: "/admin/books",
                icon: <BookOutlined />,
                label: "Quản lý sách",
                onClick: () => navigate("/admin/books"),
            },
            {
                key: "catalog",
                icon: <TagsOutlined />,
                label: "Quản lý danh mục",
                children: [
                    {
                        key: "/admin/authors",
                        icon: <EditOutlined />,
                        label: "Tác giả",
                        onClick: () => navigate("/admin/authors"),
                    },
                    {
                        key: "/admin/publishers",
                        icon: <ShopOutlined />,
                        label: "Nhà xuất bản",
                        onClick: () => navigate("/admin/publishers"),
                    },
                    {
                        key: "/admin/categories",
                        icon: <TagsOutlined />,
                        label: "Thể loại",
                        onClick: () => navigate("/admin/categories"),
                    },
                ],
            },
            {
                key: "/admin/members",
                icon: <TeamOutlined />,
                label: "Quản lý độc giả",
                onClick: () => navigate("/admin/members"),
            },
            {
                key: "borrows",
                icon: <SwapOutlined />,
                label: "Quản lý mượn trả",
                children: [
                    {
                        key: "/admin/borrows",
                        icon: <ImportOutlined />,
                        label: "Mượn sách",
                        onClick: () => navigate("/admin/borrows"),
                    },
                    {
                        key: "/admin/returns",
                        icon: <ExportOutlined />,
                        label: "Trả sách",
                        onClick: () => navigate("/admin/returns"),
                    },
                ],
            },
            {
                key: "/admin/fines",
                icon: <DollarOutlined />,
                label: "Quản lý phạt nợ",
                onClick: () => navigate("/admin/fines"),
            },
            // Chỉ hiển thị khi role là ADMIN
            ...(isAdminUser ? [
                {
                    key: "/admin/staff",
                    icon: <IdcardOutlined />,
                    label: "Quản lý nhân viên",
                    onClick: () => navigate("/admin/staff"),
                },
            ] : []),
            // {
            //     key: "/admin/reports",
            //     icon: <BarChartOutlined />,
            //     label: "Báo cáo",
            //     onClick: () => navigate("/admin/reports"),
            // },
            {
                key: "/admin/settings",
                icon: <SettingOutlined />,
                label: "Cài đặt",
                onClick: () => navigate("/admin/settings"),
            },
        ],
    },
];

// ── Component chính ───────────────────────────────────────────
const AdminLayout = ({ onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = getUserFromStorage();
    const isAdminUser = isAdminRole(user);

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const selectedKey = location.pathname;

    // Mở sẵn submenu nếu đang ở một trong các trang con
    const defaultOpenKeys = [
        ...(
            location.pathname.startsWith("/admin/authors") ||
                location.pathname.startsWith("/admin/publishers") ||
                location.pathname.startsWith("/admin/categories")
                ? ["catalog"] : []
        ),
        ...(
            location.pathname.startsWith("/admin/borrows") ||
                location.pathname.startsWith("/admin/returns")
                ? ["borrows"] : []
        ),
    ];

    // ── Logout handler ────────────────────────────────────────
    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        const hideLoading = messageApi.loading("Đang đăng xuất...", 0);
        try {
            await logoutApi();
            hideLoading();
            messageApi.success("Đăng xuất thành công!", 1);
        } catch {
            hideLoading();
        } finally {
            setIsLoggingOut(false);
            onLogout?.();
            navigate("/login");
        }
    };

    // ── Initials avatar ───────────────────────────────────────
    const getInitials = (name = "") => {
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const getRoleLabel = (roles = []) => {
        if (roles.some((r) => r.name === "ADMIN")) return "Quản trị viên";
        if (roles.some((r) => r.name === "THU_THU")) return "Thủ thư";
        return "Thành viên";
    };

    return (
        <Layout className="admin-shell">
            {contextHolder}

            {/* ═══════ SIDEBAR ═══════ */}
            <Sider width={260} className="admin-sider" theme="light">
                {/* Logo */}
                <div className="sider-logo">
                    <div className="sider-logo-icon">
                        <BankOutlined />
                    </div>
                    <span className="sider-logo-text">THƯ VIỆN</span>
                </div>

                {/* Menu */}
                <div className="sider-menu-wrapper">
                    <Menu
                        mode="inline"
                        theme="light"
                        selectedKeys={[selectedKey]}
                        defaultOpenKeys={defaultOpenKeys}
                        items={buildMenuItems(navigate, isAdminUser)}
                        className="admin-menu"
                    />
                </div>

                {/* Footer: Avatar + tên user + nút logout */}
                <div className="sider-footer">
                    <div className="sider-user">
                        <Avatar className="sider-avatar" size={36}>
                            {getInitials(user?.fullname ?? "Admin")}
                        </Avatar>
                        <div className="sider-user-info">
                            <span className="sider-user-name">
                                {user?.fullname ?? "Admin"}
                            </span>
                            <span className="sider-user-role">
                                {getRoleLabel(user?.roles ?? [])}
                            </span>
                        </div>
                    </div>

                    <Tooltip title="Đăng xuất" placement="right">
                        <button
                            className="sider-logout-btn"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            aria-label="Đăng xuất"
                        >
                            <LogoutOutlined />
                        </button>
                    </Tooltip>
                </div>
            </Sider>

            {/* ═══════ NỘI DUNG TRANG CON ═══════ */}
            <Layout className="admin-content-layout">
                <Content className="admin-content">
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;