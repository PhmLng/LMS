// ============================================================
// src/pages/BookDetailManagement/Index.jsx
// Trang Chi tiết Sách & Quản lý Ấn bản vật lý.
//
// Bố cục:
//   Header         — nút quay lại + tiêu đề
//   BookInfoCard   — ảnh bìa + thông tin tổng quan đầu sách
//   CopiesSection  — bảng danh sách ấn bản (bản sao vật lý)
//
// Routing: /admin/books/:id
// ============================================================

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Row, Col, Card, Table, Tag, Space, Button,
    Input, Select, Tooltip, Popconfirm, Spin, Alert,
    Skeleton, Modal, Form, message,
} from "antd";
import {
    ArrowLeftOutlined, EditOutlined, PlusOutlined,
    EnvironmentOutlined, MoreOutlined, BarcodeOutlined,
    DeleteOutlined,
} from "@ant-design/icons";

import { getBookByIdApi } from "../../services/bookService";
import {
    getBookCopiesApi,
    searchBookCopiesApi,
    createBookCopyApi,
    updateBookCopyApi,
    deleteBookCopyApi,
} from "../../services/bookCopyService";
import "./BookDetailManagement.css";

// ── Tình trạng ấn bản ────────────────────────────────────────
const COPY_STATUS_MAP = {
    AVAILABLE: { label: "SẴN CÓ", color: "success" },
    BORROWED: { label: "ĐANG MƯỢN", color: "processing" },
    MAINTAIN: { label: "BẢO TRÌ", color: "error" },
    LOST: { label: "MẤT", color: "default" },
};

// ── Placeholder ảnh bìa ───────────────────────────────────────
const COVER_PLACEHOLDER =
    "https://placehold.co/280x380/c8d8f0/0d2461?text=Bìa+sách";

// ── Helpers ───────────────────────────────────────────────────
const resolveImage = (url) =>
    !url || url.trim() === "" || url === "string" ? COVER_PLACEHOLDER : url;

// ============================================================
// Sub-component: Thông tin tổng quan đầu sách
// ============================================================
const BookInfoCard = ({ book, onEdit }) => {
    // Lấy tên thể loại đầu tiên (nếu có)
    const categoryName =
        book.categories?.map((c) => c.name).join(", ") ||
        book.category ||
        "—";

    const authorName = book.author?.name || book.author || "—";
    const publisherName = book.publisher?.name || book.publisher || "—";

    return (
        <Card className="book-detail-card" bordered={false}>
            <Row gutter={[40, 24]}>
                {/* ── Ảnh bìa ── */}
                <Col xs={24} sm={24} md={8} lg={7}>
                    <div className="book-cover-container">
                        <img
                            src={resolveImage(book.imageUrl)}
                            alt={book.title}
                            className="book-cover-image"
                            onError={(e) => { e.currentTarget.src = COVER_PLACEHOLDER; }}
                        />
                    </div>
                </Col>

                {/* ── Thông tin chi tiết ── */}
                <Col xs={24} sm={24} md={16} lg={17}>
                    {/* Breadcrumb catalog */}
                    <div className="book-catalog-path">
                        Thể loại
                        {categoryName !== "—" && (
                            <> / <span className="catalog-category">{categoryName.toUpperCase()}</span></>
                        )}
                    </div>

                    {/* Tiêu đề */}
                    <h1 className="book-detail-title">{book.title}</h1>

                    {/* Tác giả + NXB */}
                    <p className="book-detail-author">
                        <strong>{authorName}</strong>
                        {publisherName !== "—" && (
                            <> • <span className="book-detail-publisher">{publisherName}</span></>
                        )}
                    </p>

                    {/* Metadata: ISBN / Năm / Ngôn ngữ */}
                    <div className="book-meta-grid">
                        <div className="meta-item">
                            <span className="meta-label">MÃ ISBN</span>
                            <span className="meta-value">{book.isbn || "—"}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">NĂM XUẤT BẢN</span>
                            <span className="meta-value">{book.publishYear || "—"}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">NGÔN NGỮ</span>
                            <span className="meta-value">{book.language || "Tiếng Việt"}</span>
                        </div>
                    </div>

                    {/* Tóm tắt nội dung */}
                    {book.description && (
                        <div className="book-description">
                            <p className="description-label">TÓM TẮT NỘI DUNG</p>
                            <p className="description-text">{book.description}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="book-detail-actions">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            className="btn-edit-book"
                            onClick={onEdit}
                            size="large"
                        >
                            Chỉnh sửa thông tin
                        </Button>
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

// ============================================================
// Sub-component: Bảng danh sách ấn bản
// ============================================================
const CopiesSection = ({ bookId, onAdd }) => {
    const [messageApi, contextHolder] = message.useMessage();

    // ── State ──────────────────────────────────────────────────
    const [copies, setCopies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState("");   // giá trị đang gõ
    const [searchQuery, setSearchQuery] = useState("");   // đã xác nhận → trigger API
    const [filterStatus, setFilterStatus] = useState(undefined);

    // Pagination state — FE 1-indexed, BE 0-indexed
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
    });

    // ── Hàm load dữ liệu duy nhất ───────────────────────────────
    /**
     * Nếu có barcode (searchQuery) → gọi /book-copies/search để tìm kiếm.
     * Nếu không → gọi /book-copies để lấy danh sách thông thường.
     * Cả 2 đều truyền bookId để lọc đúng sách hiện tại.
     */
    const loadCopies = useCallback(async (page, pageSize, status, barcode) => {
        setLoading(true);
        setError(null);
        try {
            let result;
            if (barcode && barcode.trim()) {
                // Search API chỉ nhận barcode — không truyền bookId/status/page
                result = await searchBookCopiesApi(barcode.trim());
            } else {
                result = await getBookCopiesApi({
                    page,
                    size: pageSize,
                    bookId: bookId,
                    status: status || undefined,
                });
            }

            if (result.success) {
                // Search trả về data trực tiếp (object đơn) hoặc { content, totalElements }
                // → chuẩn hóa về mảng trước khi set state
                const raw = result.data;
                let content = [];
                let totalElements = 0;

                if (Array.isArray(raw)) {
                    // Trường hợp BE trả thẳng mảng
                    content = raw;
                    totalElements = raw.length;
                } else if (raw?.content) {
                    // Trường hợp BE trả Page object
                    content = raw.content;
                    totalElements = raw.totalElements ?? raw.content.length;
                } else if (raw && typeof raw === "object") {
                    // Trường hợp BE trả 1 object đơn (tìm được 1 kết quả)
                    content = [raw];
                    totalElements = 1;
                }

                setCopies(content.filter(Boolean));
                setPagination((prev) => ({
                    ...prev,
                    current: page,
                    pageSize: pageSize,
                    total: totalElements,
                }));
            } else {
                setError(result.message || "Không thể tải danh sách ấn bản.");
                setCopies([]);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi kết nối máy chủ.");
            setCopies([]);
        } finally {
            setLoading(false);
        }
    }, [bookId]);

    // Load lần đầu khi mount
    useEffect(() => {
        if (bookId) loadCopies(1, pagination.pageSize, undefined, "");
    }, [bookId]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Chuyển trang / đổi pageSize ─────────────────────────────
    const handleTableChange = (page, pageSize) => {
        loadCopies(page, pageSize, filterStatus, searchQuery);
    };

    // ── Đổi bộ lọc tình trạng ────────────────────────────────────
    const handleStatusFilterChange = (value) => {
        setFilterStatus(value);
        loadCopies(1, pagination.pageSize, value, searchQuery);
    };

    // ── Tìm kiếm barcode ─────────────────────────────────────────
    /** Bấm Enter hoặc click nút Search → xác nhận query, reset trang 1 */
    const handleSearch = () => {
        setSearchQuery(searchText);
        loadCopies(1, pagination.pageSize, filterStatus, searchText);
    };

    /** Xóa ô search → reset query, load lại toàn bộ */
    const handleClearSearch = () => {
        setSearchText("");
        setSearchQuery("");
        loadCopies(1, pagination.pageSize, filterStatus, "");
    };

    // ── Xóa ấn bản ──────────────────────────────────────────────
    const handleDeleteCopy = async (record) => {
        try {
            await deleteBookCopyApi(record.id);
            messageApi.success(`Đã xóa ấn bản ${record.barcode ?? ""} thành công!`);
            // Reload trang hiện tại giữ nguyên filter
            loadCopies(pagination.current, pagination.pageSize, filterStatus, searchQuery);
        } catch (err) {
            messageApi.error(
                err.response?.data?.message ||
                "Lỗi khi xóa ấn bản. Vui lòng thử lại."
            );
        }
    };

    // ── Modal Thêm / Sửa ấn bản ──────────────────────────────────
    // modalMode: "add" | "edit"
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [submitting, setSubmitting] = useState(false);
    const [editingCopyId, setEditingCopyId] = useState(null);
    const [copyForm] = Form.useForm();

    /** Mở modal Thêm mới */
    const handleOpenAddModal = () => {
        copyForm.resetFields();
        // Giá trị mặc định khi thêm mới
        copyForm.setFieldsValue({ status: "AVAILABLE" });
        setModalMode("add");
        setEditingCopyId(null);
        setModalOpen(true);
    };

    /** Mở modal Sửa — điền sẵn dữ liệu từ row hiện tại */
    const handleOpenEditModal = (record) => {
        copyForm.resetFields();
        copyForm.setFieldsValue({
            barcode: record.barcode,
            status: record.status,
            // locationStr đã là string dạng "Khu A - Kệ 04 - Hàng 12"
            // → tách lại từng field để điền vào form
            area: record._rawArea ?? "",
            shelf: record._rawShelf ?? "",
            row: record._rawRow ?? "",
        });
        setModalMode("edit");
        setEditingCopyId(record.id);
        setModalOpen(true);
    };

    /**
     * Submit form Thêm / Sửa.
     * - Thêm: POST /book-copies  → body gồm cả barcode
     * - Sửa:  PUT  /book-copies/{id} → body KHÔNG có barcode (theo spec)
     */
    const handleCopyFormFinish = async (values) => {
        setSubmitting(true);

        const locationPayload = {
            area: values.area || "",
            shelf: values.shelf || "",
            row: values.row || "",
        };

        try {
            let result;

            if (modalMode === "add") {
                result = await createBookCopyApi({
                    barcode: values.barcode || null,
                    location: locationPayload,
                    status: values.status,
                    bookId: Number(bookId),
                });
            } else {
                result = await updateBookCopyApi(editingCopyId, {
                    location: locationPayload,
                    status: values.status,
                    bookId: Number(bookId),
                });
            }

            if (result.success) {
                messageApi.success(
                    modalMode === "add" ? "Thêm ấn bản thành công!" : "Cập nhật ấn bản thành công!"
                );
                setModalOpen(false);
                copyForm.resetFields();
                // Refresh: thêm mới → trang 1; sửa → giữ trang hiện tại
                if (modalMode === "add") {
                    loadCopies(1, pagination.pageSize, filterStatus, searchQuery);
                } else {
                    loadCopies(pagination.current, pagination.pageSize, filterStatus, searchQuery);
                }
            } else {
                messageApi.error(result.message || "Thao tác thất bại. Vui lòng thử lại.");
            }
        } catch (err) {
            messageApi.error(
                err.response?.data?.message ||
                "Lỗi kết nối máy chủ. Vui lòng thử lại."
            );
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Map response về object phẳng tuyệt đối — KHÔNG còn field nào là Object.
     */
    const safeDataSource = copies
        .filter(Boolean)
        .map((item, index) => {
            const loc = item.location;
            let locationStr = "—";
            let rawArea = "", rawShelf = "", rawRow = "";

            if (typeof loc === "string") {
                locationStr = loc;
            } else if (loc && typeof loc === "object") {
                rawArea = loc.area ?? "";
                rawShelf = loc.shelf ?? "";
                rawRow = loc.row ?? "";
                const parts = [];
                if (rawArea) parts.push(rawArea);
                if (rawShelf) parts.push(`Kệ ${rawShelf}`);
                if (rawRow) parts.push(`Hàng ${rawRow}`);
                locationStr = parts.length > 0 ? parts.join(" - ") : "—";
            }

            return {
                key: `copy-${item.id ?? index}`,
                id: item.id ?? index,
                barcode: typeof item.barcode === "string" ? item.barcode : String(item.barcode ?? "—"),
                locationStr,
                // Giữ raw fields để điền vào form Sửa
                _rawArea: rawArea,
                _rawShelf: rawShelf,
                _rawRow: rawRow,
                status: typeof item.status === "string" ? item.status : "",
            };
        });

    // ── Bộ quét bẫy Object ───────────────────────────────────────
    // Nếu value là Object thì ép thành JSON string thay vì crash Cell2.
    const safeRender = (value) => {
        if (value === null || value === undefined) return "—";
        if (typeof value === "object") return JSON.stringify(value);
        return String(value);
    };

    // ── Cột bảng ──────────────────────────────────────────────
    const columns = [
        // Mã vạch
        {
            title: "MÃ VẠCH (BARCODE)",
            key: "barcode",
            width: 240,
            render: (_, r) => (
                <span className="barcode-text">{safeRender(r?.barcode)}</span>
            ),
        },

        // Vị trí lưu trữ — không set width, tự fill
        {
            title: "VỊ TRÍ LƯU TRỮ",
            key: "locationStr",
            render: (_, r) => (
                <span className="location-text">
                    <EnvironmentOutlined className="location-icon" />
                    {safeRender(r?.locationStr)}
                </span>
            ),
        },

        // Tình trạng
        {
            title: "TÌNH TRẠNG",
            key: "status",
            width: 150,
            align: "center",
            render: (_, r) => {
                // Đảm bảo key truyền vào MAP phải là string thuần
                const statusKey = typeof r?.status === "object"
                    ? (r?.status?.code ?? r?.status?.name)
                    : r?.status;
                const key = statusKey || "AVAILABLE";
                const cfg = COPY_STATUS_MAP[key] ?? { label: key, color: "default" };
                return (
                    <Tag color={cfg.color} className="copy-status-tag">
                        {cfg.label}
                    </Tag>
                );
            },
        },

        // Thao tác
        {
            title: "THAO TÁC",
            key: "actions",
            width: 100,
            align: "center",
            render: (_, record) => (
                <Space size={4}>
                    <Tooltip title="Chỉnh sửa">
                        <button
                            className="copy-action-btn edit"
                            onClick={() => handleOpenEditModal(record)}
                        >
                            <EditOutlined />
                        </button>
                    </Tooltip>
                    <Tooltip title="Xóa ấn bản">
                        <Popconfirm
                            title="Xác nhận xóa ấn bản"
                            description={`Bạn chắc chắn muốn xóa "${record.barcode}"?`}
                            onConfirm={() => handleDeleteCopy(record)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <button className="copy-action-btn delete">
                                <DeleteOutlined />
                            </button>
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // ── Render ────────────────────────────────────────────────
    return (
        <div className="copies-section">
            {contextHolder}

            {/* Header */}
            <div className="copies-header">
                <div>
                    <h2 className="copies-title">Danh sách bản sao</h2>
                    <p className="copies-subtitle">
                        Quản lý các bản sao vật lý trong kho
                    </p>
                </div>
                <div className="copies-header-actions">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        className="btn-add-copy"
                        onClick={handleOpenAddModal}
                        size="large"
                    >
                        Thêm mới
                    </Button>

                    {/* Bộ lọc tình trạng — gửi thẳng lên API */}
                    <Select
                        placeholder="Tình trạng"
                        allowClear
                        value={filterStatus}
                        onChange={handleStatusFilterChange}
                        size="large"
                        style={{ width: 160 }}
                    >
                        <Select.Option value="AVAILABLE">Sẵn có</Select.Option>
                        <Select.Option value="BORROWED">Đang mượn</Select.Option>
                        <Select.Option value="LOST">Mất</Select.Option>
                        <Select.Option value="DAMAGED">Hư hỏng</Select.Option>
                    </Select>

                    <Input
                        prefix={<BarcodeOutlined className="barcode-search-icon" />}
                        placeholder="Tìm mã vạch... (Enter để tìm)"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                        onClear={handleClearSearch}
                        allowClear
                        className="barcode-search-input"
                        size="large"
                    />
                </div>
            </div>

            {/* Lỗi */}
            {error && (
                <Alert
                    message={error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError(null)}
                    style={{ marginBottom: 16 }}
                    action={
                        <Button
                            size="small"
                            onClick={() => loadCopies(pagination.current, pagination.pageSize, filterStatus, searchQuery)}
                        >
                            Thử lại
                        </Button>
                    }
                />
            )}

            {/* Bảng ấn bản */}
            <div className="copies-table-wrap">
                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={safeDataSource}
                        rowKey="key"
                        className="copies-table"
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            onChange: handleTableChange,
                            onShowSizeChange: handleTableChange,
                            showSizeChanger: true,
                            pageSizeOptions: ["6", "10", "20"],
                            position: ["bottomCenter"],
                            showTotal: (total, range) =>
                                `${range[0]}–${range[1]} / ${total} ấn bản`,
                        }}
                        locale={{
                            emptyText: loading ? " " : "Chưa có ấn bản nào.",
                        }}
                    />
                </Spin>
            </div>

            {/* ── Modal Thêm / Sửa ấn bản ── */}
            <Modal
                title={modalMode === "add" ? "Thêm ấn bản mới" : "Cập nhật ấn bản"}
                open={modalOpen}
                onCancel={() => { setModalOpen(false); copyForm.resetFields(); }}
                footer={null}
                width={520}
                destroyOnClose
                className="copy-modal"
            >
                <Form
                    form={copyForm}
                    layout="vertical"
                    onFinish={handleCopyFormFinish}
                    requiredMark={false}
                    className="copy-form"
                >
                    {/* Barcode — chỉ hiển thị khi Thêm mới, PUT không có barcode */}
                    {modalMode === "add" && (
                        <Form.Item label="Mã vạch (Barcode)" name="barcode">
                            <Input placeholder="VD: LIB-AR-2024-001 (bỏ trống để tự sinh)" size="large" />
                        </Form.Item>
                    )}

                    {/* Vị trí — 3 trường area / shelf / row */}
                    <Form.Item label="Khu vực (Area)" name="area"
                        rules={[{ required: true, message: "Vui lòng nhập khu vực!" }]}
                    >
                        <Input placeholder="VD: Khu A" size="large" />
                    </Form.Item>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <Form.Item label="Số kệ (Shelf)" name="shelf"
                            rules={[{ required: true, message: "Nhập số kệ!" }]}
                        >
                            <Input placeholder="VD: 04" size="large" />
                        </Form.Item>
                        <Form.Item label="Số hàng (Row)" name="row"
                            rules={[{ required: true, message: "Nhập số hàng!" }]}
                        >
                            <Input placeholder="VD: 12" size="large" />
                        </Form.Item>
                    </div>

                    {/* Tình trạng */}
                    <Form.Item label="Tình trạng" name="status"
                        rules={[{ required: true, message: "Vui lòng chọn tình trạng!" }]}
                    >
                        <Select size="large" placeholder="Chọn tình trạng">
                            <Select.Option value="AVAILABLE">Sẵn có</Select.Option>
                            <Select.Option value="BORROWED">Đang mượn</Select.Option>
                            <Select.Option value="LOST">Mất</Select.Option>
                            <Select.Option value="DAMAGED">Hư hỏng</Select.Option>
                        </Select>
                    </Form.Item>

                    {/* Footer */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 8, borderTop: "1px solid #f0f4f9" }}>
                        <Button size="large" onClick={() => { setModalOpen(false); copyForm.resetFields(); }}>
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            size="large"
                            style={{ background: "#0d2461", borderColor: "#0d2461" }}
                        >
                            {modalMode === "add" ? "Thêm ấn bản" : "Lưu thay đổi"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

// ============================================================
// Component chính
// ============================================================
const BookDetailManagement = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    const [book, setBook] = useState(null);
    const [bookLoading, setBookLoading] = useState(true);
    const [bookError, setBookError] = useState(null);

    // Fetch thông tin đầu sách
    useEffect(() => {
        if (!id) return;

        const fetchBook = async () => {
            setBookLoading(true);
            setBookError(null);
            try {
                const result = await getBookByIdApi(id);
                if (result.success) {
                    setBook(result.data);
                } else {
                    setBookError(result.message || "Không thể tải thông tin sách.");
                }
            } catch (err) {
                setBookError(
                    err.response?.data?.message ||
                    "Lỗi kết nối máy chủ. Vui lòng thử lại."
                );
            } finally {
                setBookLoading(false);
            }
        };

        fetchBook();
    }, [id]);

    const handleEditBook = () => {
        messageApi.info("Mở form chỉnh sửa thông tin sách");
        // TODO: navigate(`/admin/books/${id}/edit`) hoặc mở Modal sửa
    };

    const handleAddCopy = () => {
        messageApi.info("Mở form thêm ấn bản mới");
        // TODO: mở Modal thêm bản sao
    };

    return (
        <div className="bdm-page">
            {contextHolder}

            {/* ── Header: nút quay lại ── */}
            <div className="bdm-top-header">
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    className="btn-back"
                    onClick={() => navigate("/admin/books")}
                >
                    Quản lý đầu sách
                </Button>
            </div>

            {/* ── Lỗi load sách ── */}
            {bookError && (
                <Alert
                    message="Không thể tải thông tin sách"
                    description={bookError}
                    type="error"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
            )}

            {/* ── Phần 1: Thông tin đầu sách ── */}
            {bookLoading ? (
                <Card className="book-detail-card" bordered={false}>
                    <Row gutter={[40, 24]}>
                        <Col xs={24} md={8} lg={7}>
                            <Skeleton.Image
                                active
                                style={{ width: "100%", height: 340, borderRadius: 12 }}
                            />
                        </Col>
                        <Col xs={24} md={16} lg={17}>
                            <Skeleton active paragraph={{ rows: 8 }} />
                        </Col>
                    </Row>
                </Card>
            ) : book ? (
                <BookInfoCard book={book} onEdit={handleEditBook} />
            ) : null}

            {/* ── Phần 2: Danh sách ấn bản ── */}
            <CopiesSection bookId={id} onAdd={handleAddCopy} />
        </div>
    );
};

export default BookDetailManagement;