// ============================================================
// src/pages/FineManagement/FineManagement.jsx
// Trang Quản lý phạt nợ — API thật, phân trang server-side.
//
// Tab 1: Xử lý phạt tại quầy (2 tầng: quét thẻ → xử lý nợ)
//   Promise.all:
//     API 1: GET  /library-cards/search?cardCode=   → cardInfo
//     API 2: GET  /fines?cardCode=&status=PENDING   → fines[]
//   Thanh toán:
//     POST /payments/collect-cash/{readerId}
//     Body: { fineIds[], paymentMethod: "CASH_PAYMENT" }
//
// Tab 2: Danh sách phiếu phạt tổng
//   GET /fines?page=&size=&cardCode=&status=
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import {
    Tabs, Table, Input, Button, Select, Tag,
    Alert, Card, Spin, Modal, Radio,
    message, Tooltip,
} from "antd";
import {
    CreditCardOutlined, SearchOutlined,
    SwapOutlined, DollarOutlined,
    WalletOutlined,
} from "@ant-design/icons";
import { searchLibraryCardApi } from "../../services/libraryCardService";
import { getFinesApi, collectCashApi } from "../../services/fineService";
import "./FineManagement.css";

// ── Hằng số ───────────────────────────────────────────────────
const PAGE_SIZE = 10;

// ── Helper ────────────────────────────────────────────────────
const fmtDate = (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "—");
const fmtAmount = (n) => (n > 0 ? n.toLocaleString("vi-VN") + " đ" : "0 đ");

const STATUS_CONFIG = {
    PENDING: { label: "Chưa thanh toán", color: "error" },
    PAID: { label: "Đã thanh toán", color: "success" },
};

// ═══════════════════════════════════════════════════════════════
// TAB 1 — Xử lý phạt tại quầy
// ═══════════════════════════════════════════════════════════════
const Tab1Counter = () => {
    const [messageApi, contextHolder] = message.useMessage();

    // ── Stage ─────────────────────────────────────────────────
    const [stage, setStage] = useState("scan"); // "scan" | "counter"

    // ── TẦNG 1 ───────────────────────────────────────────────
    const [cardCodeInput, setCardCodeInput] = useState("");
    const [scanLoading, setScanLoading] = useState(false);

    // ── TẦNG 2 ───────────────────────────────────────────────
    const [cardInfo, setCardInfo] = useState(null);
    const [fines, setFines] = useState([]);
    const [finePagination, setFinePagination] = useState({ total: 0, page: 1 });
    const [tableLoading, setTableLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    // ── Modal thanh toán ──────────────────────────────────────
    const [payModalOpen, setPayModalOpen] = useState(false);
    const [payMethod, setPayMethod] = useState("CASH");
    const [paying, setPaying] = useState(false);

    const cardInputRef = useRef(null);

    // Focus ô nhập thẻ khi về TẦNG 1
    useEffect(() => {
        if (stage === "scan") {
            setTimeout(() => cardInputRef.current?.focus(), 100);
        }
    }, [stage]);

    // ── Fetch danh sách phạt PENDING của 1 thẻ (phân trang) ──
    const fetchFinesByCard = useCallback(async (code, page = 1) => {
        setTableLoading(true);
        try {
            const result = await getFinesApi(page, PAGE_SIZE, "PENDING", code);
            if (result.success) {
                setFines(result.data?.content ?? []);
                setFinePagination({ total: result.data?.totalElements ?? 0, page });
            } else {
                messageApi.error(result.message || "Không thể tải danh sách phạt.");
                setFines([]);
                setFinePagination({ total: 0, page: 1 });
            }
        } catch (err) {
            messageApi.error(
                err.response?.data?.message || "Lỗi kết nối. Vui lòng thử lại!"
            );
        } finally {
            setTableLoading(false);
        }
    }, [messageApi]);

    // ── TẦNG 1: Quét thẻ → Promise.all 2 API ─────────────────
    const handleScanCard = async () => {
        const code = cardCodeInput.trim().toUpperCase();
        if (!code) return;

        setScanLoading(true);
        try {
            const [cardResult, finesResult] = await Promise.all([
                searchLibraryCardApi(code),
                getFinesApi(1, PAGE_SIZE, "PENDING", code),
            ]);

            // Nếu bất kỳ API nào thất bại
            if (!cardResult.success || !finesResult.success) {
                messageApi.error("Không tìm thấy thông tin độc giả hoặc có lỗi xảy ra!");
                cardInputRef.current?.select();
                return;
            }

            // Có thẻ nhưng không có khoản phạt PENDING nào
            if (!finesResult.data?.content || finesResult.data.content.length === 0) {
                messageApi.info("Độc giả này hiện không có khoản phạt nào chưa thanh toán!");
                return;
            }

            // Thành công → chuyển TẦNG 2
            setCardInfo(cardResult.data);
            setFines(finesResult.data.content);
            setFinePagination({ total: finesResult.data.totalElements, page: 1 });
            setSelectedRowKeys([]);
            setStage("counter");
        } catch (err) {
            messageApi.error("Không tìm thấy thông tin độc giả hoặc có lỗi xảy ra!");
            cardInputRef.current?.select();
        } finally {
            setScanLoading(false);
        }
    };

    // ── Reset toàn bộ về TẦNG 1 ──────────────────────────────
    const handleReset = () => {
        setStage("scan");
        setCardCodeInput("");
        setCardInfo(null);
        setFines([]);
        setFinePagination({ total: 0, page: 1 });
        setSelectedRowKeys([]);
        setPayModalOpen(false);
        setPayMethod("CASH");
    };

    // ── Chuyển trang trong TẦNG 2 ────────────────────────────
    const handlePageChange = (page) => {
        setSelectedRowKeys([]);
        fetchFinesByCard(cardInfo?.cardCode, page);
    };

    // ── Tổng tiền các dòng đang chọn ─────────────────────────
    const totalSelected = fines
        .filter((f) => selectedRowKeys.includes(f.id))
        .reduce((sum, f) => sum + (f.amount ?? 0), 0);

    // ── Xác nhận thanh toán → POST /payments/collect-cash/{readerId} ──
    const handlePay = async () => {
        // Lấy readerId từ khoản phạt đầu tiên trong danh sách được chọn
        const firstSelected = fines.find((f) => selectedRowKeys.includes(f.id));
        const readerId = firstSelected?.readerId;

        if (!readerId) {
            messageApi.error("Không xác định được độc giả. Vui lòng thử lại!");
            return;
        }

        setPaying(true);
        try {
            const payload = {
                fineIds: selectedRowKeys,
                paymentMethod: "CASH_PAYMENT",
            };
            console.log("📦 Payload thanh toán:", { readerId, ...payload });

            const result = await collectCashApi(readerId, payload);
            if (!result.success) throw new Error(result.message);

            messageApi.success("Thanh toán khoản phạt thành công!");
            setPayModalOpen(false);
            setSelectedRowKeys([]);
            // Fetch lại danh sách — nếu còn nợ thì hiển thị, hết nợ thì table empty
            fetchFinesByCard(cardInfo?.cardCode, 1);
        } catch (err) {
            messageApi.error(
                err.response?.data?.message || err.message || "Thanh toán thất bại. Vui lòng thử lại!"
            );
        } finally {
            setPaying(false);
        }
    };

    // ── Cột bảng TẦNG 2 ──────────────────────────────────────
    const columns = [
        {
            title: "STT", key: "stt", width: 52, align: "center",
            render: (_, __, i) => (
                <span className="cell-stt">
                    {(finePagination.page - 1) * PAGE_SIZE + i + 1}
                </span>
            ),
        },
        {
            title: "TÊN SÁCH", key: "bookTitle",
            render: (_, r) => <span className="fm-book-title">{r.bookTitle}</span>,
        },
        {
            title: "LÝ DO PHẠT", key: "reason", width: 220,
            render: (_, r) => <span className="fm-reason-text">{r.reason}</span>,
        },
        {
            title: "NGÀY PHÁT SINH", key: "createdAt", width: 165, align: "center",
            render: (_, r) => <span className="fm-date-text">{fmtDate(r.createdAt)}</span>,
        },
        {
            title: "SỐ TIỀN PHẠT", key: "amount", width: 140, align: "right",
            render: (_, r) => <span className="fm-amount-text">{fmtAmount(r.amount)}</span>,
        },
        {
            title: "TRẠNG THÁI", key: "status", width: 155, align: "center",
            render: (_, r) => {
                const cfg = STATUS_CONFIG[r.status] ?? { label: r.status, color: "default" };
                return <Tag color={cfg.color} className="fm-status-tag">{cfg.label}</Tag>;
            },
        },
    ];

    // ── Tên hiển thị Defensive UX ────────────────────────────
    const readerDisplayName = cardInfo?.readerName?.trim()
        ? cardInfo.readerName
        : cardInfo?.cardCode;

    return (
        <div>
            {contextHolder}

            {/* ══ TẦNG 1: Chờ quét thẻ ══ */}
            {stage === "scan" && (
                <div className="fm-stage1-wrapper">
                    <Spin spinning={scanLoading} size="large">
                        <Card className="fm-scan-card">
                            <div className="fm-scan-icon-wrap">
                                <WalletOutlined />
                            </div>
                            <h2 className="fm-scan-title">Kiểm tra phạt nợ</h2>
                            <p className="fm-scan-desc">
                                Quét hoặc nhập mã thẻ độc giả để kiểm tra khoản nợ
                            </p>
                            <Input
                                ref={cardInputRef}
                                value={cardCodeInput}
                                onChange={(e) => setCardCodeInput(e.target.value.toUpperCase())}
                                onPressEnter={handleScanCard}
                                placeholder="VD: LIB260001"
                                size="large"
                                className="fm-card-input"
                                disabled={scanLoading}
                                autoFocus
                            />
                            <div className="fm-card-input-hint">
                                <span>Nhấn</span>
                                <span className="fm-enter-badge">Enter ↵</span>
                                <span>để tra cứu</span>
                            </div>
                        </Card>
                    </Spin>
                </div>
            )}

            {/* ══ TẦNG 2: Quầy xử lý phạt ══ */}
            {stage === "counter" && cardInfo && (
                <>
                    {/* Alert thông tin độc giả */}
                    <Alert
                        className="fm-reader-alert"
                        type="info"
                        showIcon={false}
                        message={
                            <div style={{
                                display: "flex", alignItems: "center",
                                justifyContent: "space-between", width: "100%",
                            }}>
                                <div className="fm-reader-info-text">
                                    <CreditCardOutlined style={{ fontSize: 17, color: "#0d2461" }} />
                                    Đang xử lý phạt nợ cho độc giả:{" "}
                                    <strong>{readerDisplayName}</strong>
                                    {cardInfo.readerName?.trim() && (
                                        <> — Mã thẻ: <strong>{cardInfo.cardCode}</strong></>
                                    )}
                                </div>
                                <Button
                                    icon={<SwapOutlined />}
                                    onClick={handleReset}
                                    className="fm-change-btn"
                                    size="small"
                                >
                                    Đổi độc giả
                                </Button>
                            </div>
                        }
                    />

                    {/* Table danh sách phạt */}
                    <div className="fm-table-wrap">
                        <Spin spinning={tableLoading}>
                            <Table
                                rowSelection={{
                                    selectedRowKeys,
                                    onChange: (keys) => setSelectedRowKeys(keys),
                                    getCheckboxProps: (r) => ({
                                        disabled: r.status === "PAID",
                                    }),
                                }}
                                columns={columns}
                                dataSource={fines}
                                rowKey="id"
                                className="fm-table"
                                loading={false}
                                pagination={{
                                    current: finePagination.page,
                                    pageSize: PAGE_SIZE,
                                    total: finePagination.total,
                                    onChange: handlePageChange,
                                    showSizeChanger: false,
                                    position: ["bottomCenter"],
                                    showTotal: (total, range) =>
                                        `${range[0]}–${range[1]} / ${total} khoản phạt`,
                                }}
                                locale={{ emptyText: "Không có khoản phạt nào." }}
                            />
                        </Spin>

                        {/* Footer xác nhận */}
                        <div className="fm-footer-bar">
                            <div className="fm-selected-summary">
                                {selectedRowKeys.length > 0 ? (
                                    <>
                                        Đã chọn <strong>{selectedRowKeys.length}</strong> khoản
                                        <span className="fm-total-amount">
                                            {fmtAmount(totalSelected)}
                                        </span>
                                    </>
                                ) : (
                                    <span style={{ color: "#94a3b8" }}>
                                        Chưa chọn khoản phạt nào để thanh toán
                                    </span>
                                )}
                            </div>
                            <Button
                                icon={<DollarOutlined />}
                                onClick={() => setPayModalOpen(true)}
                                disabled={selectedRowKeys.length === 0}
                                className="fm-confirm-btn"
                                size="large"
                            >
                                Xác nhận thanh toán
                            </Button>
                        </div>
                    </div>
                </>
            )}

            {/* ══ MODAL XÁC NHẬN THANH TOÁN ══ */}
            <Modal
                title="💳 Xác nhận thanh toán"
                open={payModalOpen}
                onCancel={() => !paying && setPayModalOpen(false)}
                footer={null}
                width={460}
                className="fm-payment-modal"
                destroyOnClose
            >
                {/* Tóm tắt khoản thanh toán */}
                <div className="fm-payment-summary">
                    <div className="fm-payment-summary-row">
                        <span>Độc giả</span>
                        <span style={{ fontWeight: 600, color: "#0d2461" }}>
                            {cardInfo?.readerName || cardInfo?.cardCode}
                        </span>
                    </div>
                    <div className="fm-payment-summary-row">
                        <span>Số khoản phạt</span>
                        <span style={{ fontWeight: 600 }}>{selectedRowKeys.length} khoản</span>
                    </div>
                    <div className="fm-payment-summary-row">
                        <span className="fm-total-label">Tổng số tiền</span>
                        <span className="fm-total-value">{fmtAmount(totalSelected)}</span>
                    </div>
                </div>

                {/* Phương thức thanh toán */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
                        Phương thức thanh toán
                    </div>
                    <Radio.Group
                        value={payMethod}
                        onChange={(e) => setPayMethod(e.target.value)}
                        style={{ display: "flex", gap: 12 }}
                    >
                        <Radio.Button
                            value="CASH"
                            style={{ flex: 1, textAlign: "center", borderRadius: 8, height: 42, lineHeight: "42px" }}
                        >
                            💵 Tiền mặt
                        </Radio.Button>
                        <Radio.Button
                            value="TRANSFER"
                            style={{ flex: 1, textAlign: "center", borderRadius: 8, height: 42, lineHeight: "42px" }}
                        >
                            🏦 Chuyển khoản
                        </Radio.Button>
                    </Radio.Group>
                </div>

                <div className="fm-modal-footer">
                    <Button size="large" onClick={() => setPayModalOpen(false)} disabled={paying}>
                        Hủy
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        loading={paying}
                        onClick={handlePay}
                        className="fm-confirm-btn"
                    >
                        Xác nhận {fmtAmount(totalSelected)}
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// TAB 2 — Danh sách phiếu phạt tổng
// ═══════════════════════════════════════════════════════════════
const Tab2List = () => {
    const [messageApi, contextHolder] = message.useMessage();

    // ── Data states ───────────────────────────────────────────
    const [dataSource, setDataSource] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ── Filter / Search ───────────────────────────────────────
    const [searchText, setSearchText] = useState("");   // controlled input
    const [searchQuery, setSearchQuery] = useState("");   // đã xác nhận → trigger API
    const [filterStatus, setFilterStatus] = useState("ALL");

    // ── Pagination ────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);

    // ── Fetch toàn bộ phiếu phạt ─────────────────────────────
    const fetchAll = useCallback(async (page, status, cardCode) => {
        setLoading(true);
        setError(null);
        try {
            const result = await getFinesApi(page, PAGE_SIZE, status, cardCode);
            if (result.success) {
                setDataSource(result.data?.content ?? []);
                setTotalElements(result.data?.totalElements ?? 0);
            } else {
                setError(result.message || "Không thể tải danh sách phiếu phạt.");
                setDataSource([]);
                setTotalElements(0);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi kết nối máy chủ. Vui lòng thử lại.");
            setDataSource([]);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    }, []);

    // Trigger khi đổi trang, bộ lọc, hoặc từ khoá tìm kiếm
    useEffect(() => {
        fetchAll(currentPage, filterStatus, searchQuery);
    }, [currentPage, filterStatus, searchQuery, fetchAll]);

    // ── Cột bảng Tab 2 ───────────────────────────────────────
    const columns = [
        {
            title: "STT", key: "stt", width: 52, align: "center",
            render: (_, __, i) => (
                <span className="cell-stt">{(currentPage - 1) * PAGE_SIZE + i + 1}</span>
            ),
        },
        {
            title: "MÃ THẺ", key: "cardCode", width: 130,
            render: (_, r) => (
                <span style={{ fontFamily: "Consolas, monospace", fontSize: 13, fontWeight: 600, color: "#374151" }}>
                    {r.cardCode ?? "—"}
                </span>
            ),
        },
        {
            title: "TÊN ĐỘC GIẢ", key: "readerName", width: 180,
            render: (_, r) => <span className="fm-book-title">{r.readerName ?? "—"}</span>,
        },
        {
            title: "TÊN SÁCH", key: "bookTitle",
            render: (_, r) => (
                <span style={{ fontSize: 13, color: "#475569" }}>{r.bookTitle ?? "—"}</span>
            ),
        },
        {
            title: "LÝ DO", key: "reason", width: 200,
            render: (_, r) => <span className="fm-reason-text">{r.reason ?? "—"}</span>,
        },
        {
            title: "NGÀY PHÁT SINH", key: "createdAt", width: 165, align: "center",
            render: (_, r) => <span className="fm-date-text">{fmtDate(r.createdAt)}</span>,
        },
        {
            title: "SỐ TIỀN", key: "amount", width: 120, align: "right",
            render: (_, r) => <span className="fm-amount-text">{fmtAmount(r.amount)}</span>,
        },
        {
            title: "TRẠNG THÁI", key: "status", width: 155, align: "center",
            render: (_, r) => {
                const cfg = STATUS_CONFIG[r.status] ?? { label: r.status, color: "default" };
                return <Tag color={cfg.color} className="fm-status-tag">{cfg.label}</Tag>;
            },
        },
    ];

    return (
        <div>
            {contextHolder}

            {/* Toolbar */}
            <div className="fm-toolbar">
                <Input
                    prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                    placeholder="Tìm theo Mã thẻ / Tên độc giả... (Enter để tìm)"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={() => { setSearchQuery(searchText.trim()); setCurrentPage(1); }}
                    onClear={() => { setSearchText(""); setSearchQuery(""); setCurrentPage(1); }}
                    allowClear size="large" className="fm-search"
                />
                <Select
                    value={filterStatus}
                    onChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}
                    size="large" className="fm-status-filter"
                >
                    <Select.Option value="ALL">Tất cả trạng thái</Select.Option>
                    <Select.Option value="PENDING">Chưa thanh toán</Select.Option>
                    <Select.Option value="PAID">Đã thanh toán</Select.Option>
                </Select>
            </div>

            {/* Lỗi */}
            {error && (
                <Alert
                    message="Không thể tải dữ liệu" description={error}
                    type="error" showIcon closable onClose={() => setError(null)}
                    style={{ marginBottom: 16 }}
                    action={
                        <Button size="small" onClick={() => fetchAll(currentPage, filterStatus, searchQuery)}>
                            Thử lại
                        </Button>
                    }
                />
            )}

            {/* Table */}
            <div className="fm-table-wrap">
                <Spin spinning={loading} size="large">
                    <Table
                        columns={columns}
                        dataSource={dataSource}
                        rowKey="id"
                        className="fm-table"
                        loading={false}
                        pagination={{
                            current: currentPage,
                            pageSize: PAGE_SIZE,
                            total: totalElements,
                            onChange: (p) => setCurrentPage(p),
                            showSizeChanger: false,
                            position: ["bottomCenter"],
                            showTotal: (total, range) =>
                                `${range[0]}–${range[1]} / ${total} phiếu phạt`,
                        }}
                        locale={{ emptyText: loading ? " " : "Không tìm thấy phiếu phạt nào." }}
                    />
                </Spin>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// Component gốc
// ═══════════════════════════════════════════════════════════════
const FineManagement = () => {
    const tabItems = [
        {
            key: "counter",
            label: (
                <span>
                    <WalletOutlined style={{ marginRight: 6 }} />
                    Xử lý phạt tại quầy
                </span>
            ),
            children: <Tab1Counter />,
        },
        {
            key: "list",
            label: (
                <span>
                    <SearchOutlined style={{ marginRight: 6 }} />
                    Danh sách phiếu phạt tổng
                </span>
            ),
            children: <Tab2List />,
        },
    ];

    return (
        <div className="fm-page">
            <div className="fm-header">
                <div>
                    <h1 className="fm-title">Quản lý phạt nợ</h1>
                    <p className="fm-subtitle">
                        Xử lý thu phạt tại quầy và tra cứu lịch sử phiếu phạt
                    </p>
                </div>
            </div>
            <Tabs
                defaultActiveKey="counter"
                items={tabItems}
                className="fm-tabs"
                destroyInactiveTabPane={false}
            />
        </div>
    );
};

export default FineManagement;