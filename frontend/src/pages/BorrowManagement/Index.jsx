// ============================================================
// src/pages/BorrowManagement/Index.jsx
// Trang Quản lý Mượn sách — API thật, phân trang server-side.
//
// Endpoint list : GET  /loan-slips?page&size&status&cardCode
// Endpoint create: POST /loan-slips
// Endpoint search card: GET /library-cards/search?cardCode=
//
// status: BORROWING | OVERDUE | COMPLETED | PARTIALLY_RETURN | LOST
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from "react";
import dayjs from "dayjs";
import {
    Table, Input, Button, Select, Tag,
    Tooltip, Modal, Form, DatePicker, Divider,
    Spin, Alert, message,
} from "antd";
import {
    PlusOutlined, SearchOutlined,
    EyeOutlined, BookOutlined, DeleteOutlined,
    IdcardOutlined, CheckCircleOutlined, CloseCircleOutlined,
} from "@ant-design/icons";
import { getLoanSlipsApi, createLoanSlipApi } from "../../services/borrowService";
import { searchLibraryCardApi } from "../../services/libraryCardService.js";
import "./BorrowManagement.css";

// ── Hằng số ──────────────────────────────────────────────────
const PAGE_SIZE = 10;

const STATUS_MAP = {
    BORROWING: { label: "ĐANG MƯỢN", color: "processing" },
    OVERDUE: { label: "QUÁ HẠN", color: "error" },
    COMPLETED: { label: "HOÀN THÀNH", color: "success" },
    PARTIALLY_RETURN: { label: "TRẢ MỘT PHẦN", color: "warning" },
    LOST: { label: "MẤT SÁCH", color: "default" },
};

const CARD_STATUS_MAP = {
    ACTIVE: { label: "Đang hoạt động", color: "#10b981" },
    LOCKED: { label: "Đã khóa", color: "#ef4444" },
    EXPIRED: { label: "Quá hạn", color: "#f59e0b" },
};

// ── Helper ────────────────────────────────────────────────────
const fmt = (d) => (d ? dayjs(d).format("DD/MM/YYYY") : "—");
const fmtFull = (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "—");

// ── Component chính ───────────────────────────────────────────
const BorrowManagement = () => {
    const [messageApi, contextHolder] = message.useMessage();

    // ── Data states ───────────────────────────────────────────
    const [dataSource, setDataSource] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ── Filter / Search (trang chính) ─────────────────────────
    const [searchText, setSearchText] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");

    // ── Pagination ────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);

    // ── Modal states ──────────────────────────────────────────
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [borrowForm] = Form.useForm();

    // ── State tìm kiếm thẻ trong Modal ───────────────────────
    const [cardSearching, setCardSearching] = useState(false); // loading khi gọi API thẻ
    const [selectedCardId, setSelectedCardId] = useState(null);  // id thẻ đã tìm thấy
    const [cardInfo, setCardInfo] = useState(null);  // object data thẻ

    // ── State danh sách barcode đã quét ──────────────────────
    const [scannedBarcodes, setScannedBarcodes] = useState([]);  // ["BC-01", "BC-02", ...]
    const [barcodeInput, setBarcodeInput] = useState("");  // ô nhập barcode
    const barcodeInputRef = useRef(null);

    // ── Fetch danh sách phiếu mượn ────────────────────────────
    const fetchLoans = useCallback(async (page, status, cardCode) => {
        setLoading(true);
        setError(null);
        try {
            const result = await getLoanSlipsApi(page, PAGE_SIZE, status, cardCode);
            if (result.success) {
                setDataSource(result.data?.content ?? []);
                setTotalElements(result.data?.totalElements ?? 0);
            } else {
                setError(result.message || "Không thể tải danh sách phiếu mượn.");
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

    useEffect(() => {
        fetchLoans(currentPage, filterStatus, searchQuery);
    }, [currentPage, filterStatus, searchQuery, fetchLoans]);

    // ── Tìm kiếm thẻ theo mã ─────────────────────────────────
    const handleSearchCard = async () => {
        const code = borrowForm.getFieldValue("libraryCardCode")?.trim();
        if (!code) return;

        setCardSearching(true);
        setCardInfo(null);
        setSelectedCardId(null);

        try {
            const result = await searchLibraryCardApi(code);
            if (result.success && result.data) {
                setCardInfo(result.data);
                setSelectedCardId(result.data.id);
            } else {
                messageApi.error("Mã thẻ không tồn tại!");
            }
        } catch (err) {
            messageApi.error(
                err.response?.data?.message || "Mã thẻ không tồn tại!"
            );
            setCardInfo(null);
            setSelectedCardId(null);
        } finally {
            setCardSearching(false);
        }
    };

    // ── Thêm barcode vào danh sách ────────────────────────────
    const handleAddBarcode = () => {
        const val = barcodeInput.trim();
        if (!val) return;
        if (scannedBarcodes.includes(val)) {
            messageApi.warning(`Barcode "${val}" đã được thêm!`);
            return;
        }
        setScannedBarcodes((prev) => [...prev, val]);
        setBarcodeInput("");
        // Focus lại ô nhập để quét tiếp
        setTimeout(() => barcodeInputRef.current?.focus(), 50);
    };

    const handleRemoveBarcode = (barcode) => {
        setScannedBarcodes((prev) => prev.filter((b) => b !== barcode));
    };

    // ── Reset toàn bộ state Modal ────────────────────────────
    const resetModal = () => {
        borrowForm.resetFields();
        setCardInfo(null);
        setSelectedCardId(null);
        setScannedBarcodes([]);
        setBarcodeInput("");
    };

    const handleOpenModal = () => {
        resetModal();
        borrowForm.setFieldsValue({ dueDate: dayjs().add(14, "day") });
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        resetModal();
    };

    // ── Submit tạo phiếu mượn ────────────────────────────────
    const handleFormFinish = async (values) => {
        // Validate: phải có thẻ hợp lệ
        if (!selectedCardId) {
            messageApi.error("Vui lòng nhập mã thẻ và nhấn Enter để xác nhận!");
            return;
        }
        // Validate: phải có ít nhất 1 barcode
        if (scannedBarcodes.length === 0) {
            messageApi.error("Vui lòng thêm ít nhất 1 mã barcode sách!");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                cardId: selectedCardId,
                barcodes: scannedBarcodes,
                dueDate: dayjs(values.dueDate).format("YYYY-MM-DD"),
            };

            console.log("📦 Payload gửi API:", payload);

            const result = await createLoanSlipApi(payload);
            if (!result.success) throw new Error(result.message);

            messageApi.success("Tạo phiếu mượn thành công!");
            handleCloseModal();

            if (currentPage === 1) fetchLoans(1, filterStatus, searchQuery);
            else setCurrentPage(1);
        } catch (err) {
            messageApi.error(
                err.response?.data?.message || err.message || "Có lỗi xảy ra. Vui lòng thử lại!"
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ── Handlers trang chính ──────────────────────────────────
    const handleStatusChange = (value) => {
        setFilterStatus(value);
        setCurrentPage(1);
    };
    const handlePageChange = (page) => setCurrentPage(page);

    // ── Expanded row: Chi tiết sách trong phiếu ──────────────
    const expandedRowRender = (record) => {
        const details = record.loanDetailResponses ?? [];
        if (details.length === 0) {
            return (
                <div className="bm-expand-panel" style={{ color: "#94a3b8" }}>
                    Không có dữ liệu chi tiết.
                </div>
            );
        }
        return (
            <div className="bm-expand-panel">
                <div className="bm-expand-title">
                    📚 Chi tiết sách trong phiếu mượn #{record.id}
                </div>
                <div className="bm-book-list">
                    {details.map((item) => {
                        const cfg = STATUS_MAP[item.status] ?? { label: item.status, color: "default" };
                        return (
                            <div key={item.id} className="bm-book-item">
                                {item.bookMinimalResponse?.imageUrl ? (
                                    <img
                                        src={item.bookMinimalResponse.imageUrl}
                                        alt=""
                                        className="bm-book-thumb"
                                    />
                                ) : (
                                    <div className="bm-book-thumb-placeholder">
                                        <BookOutlined />
                                    </div>
                                )}
                                <div className="bm-book-info">
                                    <span className="bm-book-title">
                                        {item.bookMinimalResponse?.title ?? "—"}
                                    </span>
                                    <span className="bm-book-barcode">Barcode: {item.barcode}</span>
                                </div>
                                <div className="bm-book-meta">
                                    <Tag color={cfg.color} className="borrow-status-tag">{cfg.label}</Tag>
                                    <span>Hạn: {fmt(item.dueDate)}</span>
                                    {item.returnDate && <span>Trả: {fmt(item.returnDate)}</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // ── Cột bảng ─────────────────────────────────────────────
    const columns = [
        {
            title: "STT", key: "stt", width: 58, align: "center",
            render: (_, __, i) => (
                <span className="cell-stt">{(currentPage - 1) * PAGE_SIZE + i + 1}</span>
            ),
        },
        {
            title: "ID PHIẾU", key: "id", width: 100,
            render: (_, r) => <span className="loan-id-text">#{r.id}</span>,
        },
        {
            title: "MÃ THẺ", key: "cardCode", width: 140,
            render: (_, r) => <span className="card-code-text">{r.libraryCardCode ?? "—"}</span>,
        },
        {
            title: "TÊN ĐỘC GIẢ", key: "readerName",
            render: (_, r) => <span className="reader-name-text">{r.readerName}</span>,
        },
        {
            title: "SỐ SÁCH", key: "bookCount", width: 110, align: "center",
            render: (_, r) => (
                <span className="book-count-badge">
                    <BookOutlined style={{ fontSize: 12 }} />
                    {r.loanDetailResponses?.length ?? 0}
                </span>
            ),
        },
        {
            title: "NGÀY MƯỢN", key: "borrowDate", width: 130, align: "center",
            render: (_, r) => <span className="date-text">{fmt(r.borrowDate)}</span>,
        },
        {
            title: "HẠN TRẢ", key: "dueDate", width: 130, align: "center",
            render: (_, r) => {
                const overdue =
                    r.status !== "COMPLETED" &&
                    r.status !== "LOST" &&
                    r.dueDate &&
                    dayjs(r.dueDate).isBefore(dayjs(), "day");
                return (
                    <span className={`date-text ${overdue ? "overdue" : ""}`}>
                        {fmt(r.dueDate)}
                    </span>
                );
            },
        },
        {
            title: "TRẠNG THÁI", key: "status", width: 170, align: "center",
            render: (_, r) => {
                const cfg = STATUS_MAP[r.status] ?? { label: r.status ?? "—", color: "default" };
                return <Tag color={cfg.color} className="borrow-status-tag">{cfg.label}</Tag>;
            },
        },
        {
            title: "HÀNH ĐỘNG", key: "actions", width: 100, align: "center",
            render: () => (
                <Tooltip title="Xem chi tiết">
                    <button className="action-btn view">
                        <EyeOutlined />
                    </button>
                </Tooltip>
            ),
        },
    ];

    // ── Render ────────────────────────────────────────────────
    return (
        <div className="bm-page">
            {contextHolder}

            {/* Header */}
            <div className="bm-header">
                <div>
                    <h1 className="bm-title">Mượn sách</h1>
                    <p className="bm-subtitle">
                        {loading
                            ? "Đang tải dữ liệu..."
                            : <>Tổng cộng <strong>{totalElements.toLocaleString("vi-VN")}</strong> phiếu mượn</>}
                    </p>
                </div>
                <Button
                    type="primary" icon={<PlusOutlined />}
                    className="bm-btn-add" onClick={handleOpenModal} size="large"
                >
                    Tạo phiếu mượn
                </Button>
            </div>

            {/* Toolbar */}
            <div className="bm-toolbar">
                <Input
                    prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                    placeholder="Tìm theo Mã thẻ độc giả... (Enter để tìm)"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={() => { setSearchQuery(searchText.trim()); setCurrentPage(1); }}
                    onClear={() => { setSearchText(""); setSearchQuery(""); setCurrentPage(1); }}
                    allowClear size="large" className="bm-search"
                />
                <Select
                    value={filterStatus} onChange={handleStatusChange}
                    size="large" className="bm-status-filter"
                >
                    <Select.Option value="ALL">Tất cả trạng thái</Select.Option>
                    <Select.Option value="BORROWING">Đang mượn</Select.Option>
                    <Select.Option value="OVERDUE">Quá hạn</Select.Option>
                    <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
                    <Select.Option value="PARTIALLY_RETURN">Trả một phần</Select.Option>
                    <Select.Option value="LOST">Mất sách</Select.Option>
                </Select>
            </div>

            {/* Lỗi trang chính */}
            {error && (
                <Alert
                    message="Không thể tải dữ liệu" description={error}
                    type="error" showIcon closable onClose={() => setError(null)}
                    style={{ marginBottom: 16 }}
                    action={
                        <Button size="small" onClick={() => fetchLoans(currentPage, filterStatus, searchQuery)}>
                            Thử lại
                        </Button>
                    }
                />
            )}

            {/* Table */}
            <div className="bm-table-wrap">
                <Spin spinning={loading} size="large">
                    <Table
                        columns={columns} dataSource={dataSource}
                        rowKey="id" className="bm-table" loading={false}
                        expandable={{
                            expandedRowRender,
                            rowExpandable: (r) => (r.loanDetailResponses?.length ?? 0) > 0,
                        }}
                        pagination={{
                            current: currentPage, pageSize: PAGE_SIZE,
                            total: totalElements, onChange: handlePageChange,
                            showSizeChanger: false, position: ["bottomCenter"],
                            showTotal: (total, range) => `${range[0]}–${range[1]} / ${total} phiếu mượn`,
                        }}
                        locale={{ emptyText: loading ? " " : "Không tìm thấy phiếu mượn nào." }}
                    />
                </Spin>
            </div>

            {/* ══════════════════════════════════════════════════
                MODAL TẠO PHIẾU MƯỢN
            ══════════════════════════════════════════════════ */}
            <Modal
                title="📋 Tạo phiếu mượn mới"
                open={modalOpen} onCancel={handleCloseModal}
                footer={null} width={640} destroyOnClose className="borrow-modal"
            >
                <Form
                    form={borrowForm} layout="vertical"
                    onFinish={handleFormFinish}
                    requiredMark={false} className="borrow-form"
                >
                    {/* ── PHẦN 1: Thông tin độc giả ── */}
                    <Divider orientation="left">🪪 Thông tin độc giả</Divider>

                    <Form.Item
                        label="Mã thẻ độc giả"
                        name="libraryCardCode"
                        rules={[{ required: true, message: "Vui lòng nhập mã thẻ độc giả!" }]}
                        style={{ marginBottom: cardInfo ? 8 : undefined }}
                    >
                        <Input
                            placeholder="VD: LIB260001 — nhấn Enter để tìm kiếm"
                            size="large"
                            style={{ fontFamily: "Consolas, monospace", letterSpacing: "0.05em" }}
                            suffix={
                                cardSearching
                                    ? <Spin size="small" />
                                    : cardInfo
                                        ? <CheckCircleOutlined style={{ color: "#10b981" }} />
                                        : null
                            }
                            onPressEnter={(e) => { e.preventDefault(); handleSearchCard(); }}
                            onBlur={handleSearchCard}
                            onChange={() => {
                                // Xóa kết quả cũ khi người dùng sửa mã
                                if (cardInfo) { setCardInfo(null); setSelectedCardId(null); }
                            }}
                        />
                    </Form.Item>

                    {/* Box thông tin thẻ tìm được */}
                    {cardInfo && (
                        <div className="card-info-box">
                            <IdcardOutlined className="card-info-icon" />
                            <div className="card-info-content">
                                <span className="card-info-name">{cardInfo.readerName}</span>
                                <div className="card-info-meta">
                                    <span>Mã thẻ: <strong>{cardInfo.cardCode}</strong></span>
                                    <span className="card-info-dot">·</span>
                                    <span style={{ color: CARD_STATUS_MAP[cardInfo.status]?.color ?? "#374151", fontWeight: 600 }}>
                                        {CARD_STATUS_MAP[cardInfo.status]?.label ?? cardInfo.status}
                                    </span>
                                    <span className="card-info-dot">·</span>
                                    <span>Hết hạn: <strong>{fmt(cardInfo.expiryDate)}</strong></span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── PHẦN 2: Ngày hẹn trả ── */}
                    <Divider orientation="left">📅 Ngày hẹn trả</Divider>
                    <Form.Item
                        label="Ngày hẹn trả"
                        name="dueDate"
                        tooltip="Mặc định: hôm nay + 14 ngày"
                        rules={[{ required: true, message: "Vui lòng chọn ngày hẹn trả!" }]}
                    >
                        <DatePicker
                            format="DD/MM/YYYY" size="large"
                            disabledDate={(d) => d && d.isBefore(dayjs(), "day")}
                        />
                    </Form.Item>

                    {/* ── PHẦN 3: Quét barcode sách ── */}
                    <Divider orientation="left">📚 Sách mượn</Divider>

                    {/* Ô nhập barcode */}
                    <Form.Item label="Nhập / Quét barcode sách">
                        <div className="barcode-input-row">
                            <Input
                                ref={barcodeInputRef}
                                value={barcodeInput}
                                onChange={(e) => setBarcodeInput(e.target.value)}
                                onPressEnter={(e) => { e.preventDefault(); handleAddBarcode(); }}
                                placeholder="VD: BC-01-00002 — nhấn Enter để thêm"
                                size="large"
                                style={{ fontFamily: "Consolas, monospace" }}
                            />
                            <Button
                                type="primary" icon={<PlusOutlined />}
                                onClick={handleAddBarcode} size="large"
                                className="barcode-add-trigger-btn"
                            >
                                Thêm
                            </Button>
                        </div>
                    </Form.Item>

                    {/* Danh sách barcode đã quét */}
                    {scannedBarcodes.length > 0 && (
                        <div className="scanned-list">
                            <div className="scanned-list-header">
                                <span>Đã thêm <strong>{scannedBarcodes.length}</strong> cuốn sách</span>
                            </div>
                            {scannedBarcodes.map((barcode, index) => (
                                <div key={barcode} className="scanned-item">
                                    <span className="scanned-index">{index + 1}</span>
                                    <span className="scanned-barcode">{barcode}</span>
                                    <Tooltip title="Xóa">
                                        <button
                                            type="button"
                                            className="scanned-remove-btn"
                                            onClick={() => handleRemoveBarcode(barcode)}
                                        >
                                            <DeleteOutlined />
                                        </button>
                                    </Tooltip>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Placeholder khi chưa thêm sách */}
                    {scannedBarcodes.length === 0 && (
                        <div className="scanned-empty">
                            <BookOutlined style={{ fontSize: 22, color: "#cbd5e1" }} />
                            <span>Chưa có sách nào được thêm</span>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="form-footer">
                        <Button size="large" onClick={handleCloseModal}>Hủy</Button>
                        <Button
                            type="primary" htmlType="submit"
                            loading={submitting} size="large" className="bm-btn-add"
                        >
                            Tạo phiếu mượn
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default BorrowManagement;