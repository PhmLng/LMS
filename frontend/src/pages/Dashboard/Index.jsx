// ============================================================
// src/pages/Dashboard/Index.jsx
// Trang Tổng quan — kết nối API thật từ Backend.
//
// Data flow:
//   useEffect (mount) → getDashboardApi() → parse response.data
//   → set statsData + trendsData vào state
//   → render StatCards + Line Chart
// ============================================================

import React, { useState, useEffect } from "react";
import { Card, Badge, Spin, Alert } from "antd";
import {
    BookOutlined,
    TeamOutlined,
    UserOutlined,
    SwapOutlined,
    BellOutlined,
} from "@ant-design/icons";
import { Line } from "@ant-design/plots";
import axiosClient from "../../services/axiosClient";
import "./Dashboard.css";

// ── Cấu hình tĩnh cho 4 thẻ chỉ số ──────────────────────────
// `dataKey` trỏ đến trường tương ứng trong response.data
const CARD_CONFIG = [
    {
        key: "totalBooks",
        label: "Tổng số sách",
        badge: "+2.5%",
        badgeType: "positive",
        icon: <BookOutlined />,
        iconBg: "#dbeafe",
        iconColor: "#3b82f6",
    },
    {
        key: "totalMembers",
        label: "Thành viên",
        badge: "+12%",
        badgeType: "positive",
        icon: <TeamOutlined />,
        iconBg: "#e0e7ff",
        iconColor: "#6366f1",
    },
    {
        key: "totalAuthors",
        label: "Tác giả",
        badge: "Ổn định",
        badgeType: "neutral",
        icon: <UserOutlined />,
        iconBg: "#f3f4f6",
        iconColor: "#6b7280",
    },
    {
        key: "totalBookBorrowing",   // ← Cập nhật từ "sách quá hạn" → "đang mượn"
        label: "Sách đang mượn",
        badge: "Trực tiếp",
        badgeType: "info",
        icon: <SwapOutlined />,
        iconBg: "#fef3c7",
        iconColor: "#d97706",
    },
];

// Dữ liệu Năm dùng mock (API chưa có endpoint năm)
const CHART_DATA_YEARLY = [
    { month: "2020", value: 2100 },
    { month: "2021", value: 2500 },
    { month: "2022", value: 3200 },
    { month: "2023", value: 4100 },
    { month: "2024", value: 4800 },
    { month: "2025", value: 5200 },
];

// ── Service call ──────────────────────────────────────────────
const getDashboardApi = () => axiosClient.get("/dashboards");

// ── Helpers ───────────────────────────────────────────────────

/** Format số thêm dấu phẩy ngăn cách hàng nghìn */
const formatNumber = (num) =>
    num != null ? Number(num).toLocaleString("vi-VN") : "—";

/** Cấu hình biểu đồ @ant-design/plots */
const buildChartConfig = (data) => ({
    data,
    xField: "month",
    yField: "value",
    smooth: true,
    autoFit: true,
    line: {
        style: { stroke: "#0d2461", lineWidth: 2.5 },
    },
    area: {
        style: {
            fill: "l(270) 0:rgba(13,36,97,0) 1:rgba(13,36,97,0.10)",
        },
    },
    point: {
        size: 5,
        shape: "circle",
        style: { fill: "#0d2461", stroke: "#fff", lineWidth: 2 },
    },
    axis: {
        x: {
            label: {
                style: {
                    fontSize: 11, fontWeight: 600,
                    fill: "#94a3b8", letterSpacing: "0.08em",
                },
            },
            line: { style: { stroke: "#e8edf5" } },
            tick: false,
            grid: false,
        },
        y: {
            label: false,
            line: false,
            grid: { style: { stroke: "#f0f4f9", lineDash: [4, 4] } },
        },
    },
    tooltip: {
        showMarkers: true,
        formatter: (d) => ({ name: "Lượt mượn", value: formatNumber(d.value) }),
    },
    interactions: [{ type: "element-active" }],
    paddingLeft: 40,
    paddingRight: 50,  // Tăng rìa phải lên hẳn 50px để chừa chỗ cho số 5
    paddingBottom: 40
});

// ── Sub-components ────────────────────────────────────────────

const StatBadge = ({ text, type }) => (
    <span className={`stat-badge stat-badge--${type}`}>{text}</span>
);

const StatCard = ({ label, value, badge, badgeType, icon, iconBg, iconColor, loading }) => (
    <Card className="stat-card" bordered={false}>
        <div className="stat-card-top">
            <div className="stat-card-icon" style={{ background: iconBg, color: iconColor }}>
                {icon}
            </div>
            <StatBadge text={badge} type={badgeType} />
        </div>
        <p className="stat-card-label">{label}</p>
        {loading
            ? <div className="stat-card-skeleton" />
            : <p className="stat-card-value">{value}</p>
        }
    </Card>
);

// ── Component chính ───────────────────────────────────────────
const Dashboard = () => {
    // ── State ──
    const [statsData, setStatsData] = useState(null);   // object data từ API
    const [trendsData, setTrendsData] = useState([]);      // mảng cho biểu đồ Tháng
    const [chartMode, setChartMode] = useState("month"); // "month" | "year"
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Fetch dữ liệu khi mount ──
    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getDashboardApi();
                // axiosClient trả về axios response, data nằm trong response.data
                // Cấu trúc: { success, code, message, data: { totalBooks, trends, ... } }
                const result = response.data;

                if (result.success) {
                    const payload = result.data;

                    setStatsData({
                        totalBooks: payload.totalBooks,
                        totalMembers: payload.totalMembers,
                        totalAuthors: payload.totalAuthors,
                        totalBookBorrowing: payload.totalBookBorrowing,
                    });

                    // Map trends → { month, value } cho biểu đồ
                    // Backend trả: { month: "Tháng 1", borrowCount: 825 }
                    setTrendsData(
                        (payload.trends ?? []).map((t) => ({
                            month: t.month,
                            value: t.borrowCount,
                        }))
                    );
                } else {
                    setError(result.message || "Không thể tải dữ liệu Dashboard.");
                }
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Lỗi kết nối đến máy chủ. Vui lòng thử lại."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []); // Chỉ gọi 1 lần khi admin mở Dashboard

    // Dữ liệu hiển thị biểu đồ theo chế độ toggle
    const chartData = chartMode === "month" ? trendsData : CHART_DATA_YEARLY;

    // ── Render ────────────────────────────────────────────────
    return (
        <div className="dashboard-page">

            {/* ── Page Header ── */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Kho sách</h1>
                    <p className="dashboard-subtitle">
                        Chào mừng quay lại, đây là cập nhật hôm nay cho hệ thống thư viện.
                    </p>
                </div>
                <div className="dashboard-header-actions">
                    <Badge count={3} size="small" offset={[-2, 2]}>
                        <button className="bell-btn" aria-label="Thông báo">
                            <BellOutlined />
                        </button>
                    </Badge>
                </div>
            </div>

            {/* ── Thông báo lỗi ── */}
            {error && (
                <Alert
                    message="Không thể tải dữ liệu"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError(null)}
                    style={{ marginBottom: 24 }}
                />
            )}

            {/* ── Stat Cards ── */}
            <div className="stat-cards-grid">
                {CARD_CONFIG.map((cfg) => (
                    <StatCard
                        key={cfg.key}
                        {...cfg}
                        loading={loading}
                        value={formatNumber(statsData?.[cfg.key])}
                    />
                ))}
            </div>

            {/* ── Chart Card ── */}
            <Card className="chart-card" bordered={false}>
                <div className="chart-card-header">
                    <div>
                        <h2 className="chart-title">Xu hướng mượn sách</h2>
                        <p className="chart-subtitle">
                            Thống kê lưu lượng mượn sách{" "}
                            {chartMode === "month" ? "theo tháng" : "theo năm"}
                        </p>
                    </div>
                    <div className="chart-toggle">
                        <button
                            className={`toggle-btn ${chartMode === "month" ? "active" : ""}`}
                            onClick={() => setChartMode("month")}
                        >
                            Tháng
                        </button>
                        <button
                            className={`toggle-btn ${chartMode === "year" ? "active" : ""}`}
                            onClick={() => setChartMode("year")}
                        >
                            Năm
                        </button>
                    </div>
                </div>

                {/* Spinner toàn chart khi đang fetch */}
                <div className="chart-wrapper">
                    {loading ? (
                        <div className="chart-loading">
                            <Spin size="large" />
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className="chart-loading">
                            <p style={{ color: "#94a3b8" }}>Chưa có dữ liệu xu hướng.</p>
                        </div>
                    ) : (
                        <Line {...buildChartConfig(chartData)} />
                    )}
                </div>
            </Card>

        </div>
    );
};

export default Dashboard;