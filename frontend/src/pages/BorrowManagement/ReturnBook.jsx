// ============================================================
// src/pages/BorrowManagement/ReturnBook.jsx
// Trang Trả sách tại quầy — 2 tầng trạng thái.
//
// Cơ chế 2 tầng:
//   TẦNG 1 (stage = "scan")  : Chờ nhập/quét mã thẻ độc giả
//   TẦNG 2 (stage = "return"): Quầy xử lý chọn sách & xác nhận
//
// Tầng 1 dùng Promise.all gọi đồng thời 2 API:
//   API 1: GET /library-cards/search?cardCode=   → cardInfo
//   API 2: GET /return/return-items?cardCode=    → loanDetails[]
//
// rowKey của Table: "barcode"
// ============================================================

import React, { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";
import {
    Table, Input, Button, Select, Tag, Alert,
    Card, Spin, Tooltip, message,
} from "antd";
import {
    CreditCardOutlined, SwapOutlined,
    ScanOutlined, CheckOutlined, ReloadOutlined,
} from "@ant-design/icons";
import { searchLibraryCardApi } from "../../services/libraryCardService";
import { getReturnItemsApi, confirmReturnApi } from "../../services/returnService";
import "./ReturnBook.css";



// ── Helper ────────────────────────────────────────────────────
const fmt = (d) => (d ? dayjs(d).format("DD/MM/YYYY") : "—");
const fmtFine = (n) => (n > 0 ? n.toLocaleString("vi-VN") + " đ" : null);

// ── Component chính ───────────────────────────────────────────
const ReturnBook = () => {
    const [messageApi, contextHolder] = message.useMessage();

    // ── Stage ─────────────────────────────────────────────────
    const [stage, setStage] = useState("scan"); // "scan" | "return"

    // ── State TẦNG 1 ─────────────────────────────────────────
    const [cardCodeInput, setCardCodeInput] = useState("");
    const [scanLoading, setScanLoading] = useState(false);

    // ── State TẦNG 2 ─────────────────────────────────────────
    const [cardInfo, setCardInfo] = useState(null);  // object từ API 1
    const [loanDetails, setLoanDetails] = useState([]);    // mảng từ API 2
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);    // barcode đã chọn
    const [bookStatuses, setBookStatuses] = useState({});    // { [barcode]: "NORMAL"|"DAMAGED"|"LOST" }
    const [barcodeInput, setBarcodeInput] = useState("");    // ô quét barcode sách
    const [confirming, setConfirming] = useState(false);

    // ── Refs ──────────────────────────────────────────────────
    const cardInputRef = useRef(null);
    const barcodeInputRef = useRef(null);

    // Focus ô mã thẻ khi về TẦNG 1
    useEffect(() => {
        if (stage === "scan") {
            setTimeout(() => cardInputRef.current?.focus(), 100);
        }
    }, [stage]);

    // Focus ô barcode khi vào TẦNG 2
    useEffect(() => {
        if (stage === "return") {
            setTimeout(() => barcodeInputRef.current?.focus(), 100);
        }
    }, [stage]);

    // ── TẦNG 1: Gọi đồng thời 2 API bằng Promise.all ─────────
    const handleScanCard = async () => {
        const code = cardCodeInput.trim().toUpperCase();
        if (!code) return;

        setScanLoading(true);
        try {
            const [cardResult, itemsResult] = await Promise.all([
                searchLibraryCardApi(code),
                getReturnItemsApi(code),
            ]);

            // Nếu bất kỳ API nào thất bại → báo lỗi, ở lại TẦNG 1
            if (!cardResult.success || !itemsResult.success) {
                messageApi.error("Không tìm thấy thông tin độc giả hoặc có lỗi xảy ra!");
                cardInputRef.current?.select();
                return;
            }

            // Có thẻ nhưng không mượn sách nào
            if (!itemsResult.data || itemsResult.data.length === 0) {
                messageApi.info("Độc giả này hiện không có sách cần trả!");
                return;
            }

            // Thành công → khởi tạo bookStatuses mặc định NORMAL cho tất cả sách
            const defaultStatuses = {};
            itemsResult.data.forEach((item) => {
                defaultStatuses[item.barcode] = "NORMAL";
            });
            setBookStatuses(defaultStatuses);
            setCardInfo(cardResult.data);
            setLoanDetails(itemsResult.data);
            setSelectedRowKeys([]);
            setStage("return");
        } catch (err) {
            messageApi.error(
                err.response?.data?.message || "Lỗi kết nối. Vui lòng thử lại!"
            );
        } finally {
            setScanLoading(false);
        }
    };

    // ── Reset toàn bộ về TẦNG 1 ──────────────────────────────
    const handleReset = () => {
        setStage("scan");
        setCardCodeInput("");
        setCardInfo(null);
        setLoanDetails([]);
        setSelectedRowKeys([]);
        setBookStatuses({});
        setBarcodeInput("");
    };

    // ── TẦNG 2: Quét barcode → tự động tick checkbox ──────────
    const handleScanBarcode = () => {
        const val = barcodeInput.trim();
        if (!val) return;

        const found = loanDetails.find((item) => item.barcode === val);
        if (!found) {
            messageApi.error("Sách không nằm trong danh sách mượn của độc giả!");
            setBarcodeInput("");
            barcodeInputRef.current?.focus();
            return;
        }

        if (selectedRowKeys.includes(val)) {
            messageApi.warning(`Sách "${val}" đã được chọn rồi!`);
            setBarcodeInput("");
            barcodeInputRef.current?.focus();
            return;
        }

        setSelectedRowKeys((prev) => [...prev, val]);
        setBarcodeInput("");
        messageApi.success(`Đã chọn sách trả: ${found.bookTitle}`);
        barcodeInputRef.current?.focus();
    };

    // ── TẦNG 2: Xác nhận trả sách — gọi POST /return ─────────
    const handleConfirmReturn = async () => {
        if (selectedRowKeys.length === 0) return;

        // Build payload: lấy id từ loanDetails theo barcode đang chọn
        const returnItemDetailRequests = selectedRowKeys.map((barcode) => {
            const item = loanDetails.find((d) => d.barcode === barcode);

            return {
                loanDetailId: item.id,
                status: bookStatuses[barcode] ?? "NORMAL",
            };
        });

        const payload = { returnItemDetailRequests };
        console.log("📦 Payload trả sách:", payload);

        setConfirming(true);
        try {
            const result = await confirmReturnApi(payload);
            if (!result.success) throw new Error(result.message);

            messageApi.success("Xử lý trả sách thành công!");
            // Xóa sách đã trả khỏi danh sách, giữ lại sách chưa trả
            const remaining = loanDetails.filter(
                (item) => !selectedRowKeys.includes(item.barcode)
            );
            setLoanDetails(remaining);
            setSelectedRowKeys([]);
            setBookStatuses((prev) => {
                const next = { ...prev };
                selectedRowKeys.forEach((barcode) => delete next[barcode]);
                return next;
            });
        } catch (err) {
            messageApi.error(
                err.response?.data?.message || err.message || "Xác nhận trả thất bại. Vui lòng thử lại!"
            );
        } finally {
            setConfirming(false);
        }
    };

    // ── Cập nhật tình trạng sách khi đổi Select ──────────────
    const handleBookStatusChange = (barcode, value) => {
        setBookStatuses((prev) => ({ ...prev, [barcode]: value }));
    };

    // ── rowSelection config ───────────────────────────────────
    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
    };

    // ── Cột bảng TẦNG 2 ──────────────────────────────────────
    const columns = [
        {
            title: "STT", key: "stt", width: 52, align: "center",
            render: (_, __, i) => <span className="cell-stt">{i + 1}</span>,
        },
        {
            title: "MÃ VẠCh", key: "barcode", width: 150,
            render: (_, r) => <span className="rb-barcode-cell">{r.barcode}</span>,
        },
        {
            title: "TÊN SÁCH", key: "bookTitle",
            render: (_, r) => <span className="rb-book-title">{r.bookTitle}</span>,
        },
        {
            title: "NGÀY MƯỢN", key: "borrowDate", width: 130, align: "center",
            render: (_, r) => <span className="rb-date-cell">{fmt(r.borrowDate)}</span>,
        },
        {
            title: "HẠN TRẢ", key: "dueDate", width: 120, align: "center",
            render: (_, r) => (
                <span className={`rb-date-cell ${r.daysOverdue > 0 ? "overdue" : ""}`}>
                    {fmt(r.dueDate)}
                </span>
            ),
        },
        {
            title: "QUÁ HẠN", key: "daysOverdue", width: 110, align: "center",
            render: (_, r) =>
                r.daysOverdue > 0 ? (
                    <Tag color="error" className="rb-overdue-tag">
                        {r.daysOverdue} ngày
                    </Tag>
                ) : (
                    <span style={{ fontSize: 13, color: "#10b981", fontWeight: 600 }}>
                        Không
                    </span>
                ),
        },
        {
            title: "PHẠT DỰ KIẾN", key: "estimatedFine", width: 145, align: "right",
            render: (_, r) => {
                const fine = fmtFine(r.estimatedFine);
                return fine
                    ? <span className="rb-fine-text">{fine}</span>
                    : <span className="rb-fine-none">—</span>;
            },
        },
        {
            title: "TÌNH TRẠNG TRẢ", key: "returnStatus", width: 160, align: "center",
            render: (_, r) => (
                <Select
                    value={bookStatuses[r.barcode] ?? "NORMAL"}
                    onChange={(val) => handleBookStatusChange(r.barcode, val)}
                    size="small"
                    style={{ width: 130 }}
                    onClick={(e) => e.stopPropagation()}
                    options={[
                        { label: "Bình thường", value: "NORMAL" },
                        { label: "Hư hỏng", value: "DAMAGED" },
                        { label: "Mất sách", value: "LOST" },
                    ]}
                />
            ),
        },
    ];

    // ── Tổng phạt các sách đang chọn ─────────────────────────
    const totalFineSelected = loanDetails
        .filter((item) => selectedRowKeys.includes(item.barcode))
        .reduce((sum, item) => sum + (item.estimatedFine ?? 0), 0);

    // ── Tên hiển thị theo Defensive UX ───────────────────────
    const readerDisplayName = cardInfo?.readerName?.trim()
        ? `độc giả: ${cardInfo.readerName} — Mã thẻ: ${cardInfo.cardCode}`
        : `mã thẻ: ${cardInfo?.cardCode}`;

    // ── Render ────────────────────────────────────────────────
    return (
        <div className="rb-page">
            {contextHolder}

            {/* Header */}
            <div className="rb-header">
                <div>
                    <h1 className="rb-title">Trả sách</h1>
                    <p className="rb-subtitle">
                        {stage === "scan"
                            ? "Quét hoặc nhập mã thẻ độc giả để bắt đầu"
                            : `Đang xử lý • ${loanDetails.length} cuốn sách đang mượn`}
                    </p>
                </div>
                {stage === "return" && (
                    <Tooltip title="Về màn hình chờ quét thẻ khác">
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleReset}
                            className="rb-change-btn"
                            size="large"
                        >
                            Đổi độc giả
                        </Button>
                    </Tooltip>
                )}
            </div>

            {/* ═══════ TẦNG 1: Chờ quét thẻ ═══════ */}
            {stage === "scan" && (
                <div className="rb-stage1-wrapper">
                    <Spin spinning={scanLoading} size="large">
                        <Card className="rb-scan-card">
                            <div className="rb-scan-icon-wrap">
                                <CreditCardOutlined />
                            </div>
                            <h2 className="rb-scan-title">Quét thẻ độc giả</h2>
                            <p className="rb-scan-desc">
                                Đặt thẻ vào máy quét hoặc nhập thủ công mã thẻ
                                rồi nhấn Enter để tra cứu sách đang mượn
                            </p>
                            <Input
                                ref={cardInputRef}
                                value={cardCodeInput}
                                onChange={(e) =>
                                    setCardCodeInput(e.target.value.toUpperCase())
                                }
                                onPressEnter={handleScanCard}
                                placeholder="VD: LIB260001"
                                size="large"
                                className="rb-card-input"
                                disabled={scanLoading}
                                autoFocus
                            />
                            <div className="rb-card-input-hint">
                                <span>Nhấn</span>
                                <span className="rb-enter-badge">Enter ↵</span>
                                <span>để tra cứu</span>
                            </div>
                        </Card>
                    </Spin>
                </div>
            )}

            {/* ═══════ TẦNG 2: Quầy xử lý trả sách ═══════ */}
            {stage === "return" && cardInfo && (
                <>
                    {/* Alert thông tin độc giả — lấy từ state cardInfo */}
                    <Alert
                        className="rb-reader-alert"
                        type="info"
                        showIcon={false}
                        message={
                            <div style={{
                                display: "flex", alignItems: "center",
                                justifyContent: "space-between", width: "100%",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <CreditCardOutlined style={{ fontSize: 18, color: "#0d2461" }} />
                                    <span className="rb-reader-info-text">
                                        Đang xử lý trả sách cho {readerDisplayName}
                                    </span>
                                </div>
                                <Button
                                    icon={<SwapOutlined />}
                                    onClick={handleReset}
                                    className="rb-change-btn"
                                    size="small"
                                >
                                    Đổi độc giả
                                </Button>
                            </div>
                        }
                    />

                    {/* Ô quét barcode sách */}
                    <div className="rb-barcode-wrap">
                        <div className="rb-barcode-field">
                            <div className="rb-barcode-label">
                                <ScanOutlined style={{ marginRight: 6 }} />
                                Nhập hoặc quét mã vạch sách để chọn nhanh
                            </div>
                            <Input
                                ref={barcodeInputRef}
                                value={barcodeInput}
                                onChange={(e) => setBarcodeInput(e.target.value)}
                                onPressEnter={(e) => {
                                    e.preventDefault();
                                    handleScanBarcode();
                                }}
                                placeholder="VD: BC-01-00002 — nhấn Enter để chọn"
                                className="rb-barcode-input"
                                autoFocus
                            />
                        </div>
                        <Button
                            icon={<CheckOutlined />}
                            onClick={handleScanBarcode}
                            className="rb-barcode-btn"
                            size="large"
                        >
                            Chọn
                        </Button>
                    </div>

                    {/* Table danh sách sách đang mượn */}
                    <div className="rb-table-wrap">
                        <Table
                            rowSelection={rowSelection}
                            columns={columns}
                            dataSource={loanDetails}
                            rowKey="barcode"
                            className="rb-table"
                            pagination={false}
                            locale={{ emptyText: "Không có sách nào đang mượn." }}
                        />

                        {/* Footer xác nhận */}
                        <div className="rb-footer-bar">
                            <div className="rb-selected-summary">
                                {selectedRowKeys.length > 0 ? (
                                    <>
                                        Đã chọn{" "}
                                        <strong>{selectedRowKeys.length}</strong>
                                        {" "}/ {loanDetails.length} cuốn
                                        {totalFineSelected > 0 && (
                                            <span style={{ marginLeft: 12, color: "#ef4444", fontWeight: 600 }}>
                                                • Tiền phạt: {totalFineSelected.toLocaleString("vi-VN")} đ
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <span style={{ color: "#94a3b8" }}>
                                        Chưa chọn cuốn sách nào để trả
                                    </span>
                                )}
                            </div>

                            <Button
                                icon={<CheckOutlined />}
                                onClick={handleConfirmReturn}
                                loading={confirming}
                                disabled={selectedRowKeys.length === 0}
                                className="rb-confirm-btn"
                                size="large"
                            >
                                Xác nhận trả{selectedRowKeys.length > 0 ? ` ${selectedRowKeys.length} cuốn sách` : ""}
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ReturnBook;