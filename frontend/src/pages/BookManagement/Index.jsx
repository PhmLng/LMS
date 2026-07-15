// ============================================================
// src/pages/BookManagement/Index.jsx
// Trang Quản lý Sách — CRUD đầy đủ với API thật.
//
// Chế độ Modal:
//   "add"  → Thêm sách mới  (createBookApi)
//   "edit" → Cập nhật sách  (getBookByIdApi + updateBookApi)
//
// State flow:
//   searchInput     → controlled input (chưa submit)
//   appliedFilters  → { title, categoryId, status } đã xác nhận → trigger fetch
//   currentPage     → trang hiện tại (one-indexed)
//   modalMode       → "add" | "edit"
//   currentBookId   → ID sách đang sửa (null khi thêm mới)
// ============================================================

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Table, Input, Button, Select, Tag,
    Tooltip, Space, Popconfirm, Spin, Alert,
    Modal, Form, InputNumber, Upload, message,
} from "antd";
import {
    PlusOutlined, FilterOutlined, SearchOutlined,
    EyeOutlined, EditOutlined, DeleteOutlined,
    UploadOutlined, LoadingOutlined,
} from "@ant-design/icons";

// ── Import theo domain ────────────────────────────────────────
import {
    searchBooksApi,
    createBookApi,
    getBookByIdApi,
    updateBookApi,
    deleteBookApi,
} from "../../services/bookService";
import { getCategoriesApi } from "../../services/categoryService";
import { getAuthorsApi } from "../../services/authorService";
import { getPublishersApi } from "../../services/publisherService";
import { uploadImageApi } from "../../services/uploadService";

import "./BookManagement.css";

const { Option } = Select;

// ── Hằng số ──────────────────────────────────────────────────
const PAGE_SIZE = 6;

// ── Status enum map ───────────────────────────────────────────
const STATUS_MAP = {
    AVAILABLE: { label: "SẴN CÓ", color: "success" },
    OUT_OF_STOCK: { label: "HẾT HÀNG", color: "warning" },
    DISCONTINUED: { label: "NGỪNG CUNG CẤP", color: "default" },
};

// ── Bảng màu avatar bìa sách ─────────────────────────────────
const AVATAR_COLORS = [
    "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
    "#ec4899", "#06b6d4", "#f97316", "#6366f1",
];

// ── Component chính ───────────────────────────────────────────
const BookManagement = () => {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    // ── Lookup data ─────────────────────────────────────────────
    const [categories, setCategories] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [publishers, setPublishers] = useState([]);

    // ── Search / filter states ──────────────────────────────────
    const [searchInput, setSearchInput] = useState("");
    const [appliedFilters, setAppliedFilters] = useState({
        title: "",
        categoryId: undefined,
        status: undefined,
    });
    const [pendingCategory, setPendingCategory] = useState(undefined);
    const [pendingStatus, setPendingStatus] = useState(undefined);
    const [showFilter, setShowFilter] = useState(false);

    // ── Pagination & book data ──────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);
    const [books, setBooks] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ── Modal state ─────────────────────────────────────────────
    // modalMode: "add" | "edit"
    const [modalMode, setModalMode] = useState("add");
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    // ID sách đang được sửa (null khi thêm mới)
    const [currentBookId, setCurrentBookId] = useState(null);
    const [addForm] = Form.useForm();
    // Trạng thái upload ảnh bìa
    const [imagePreview, setImagePreview] = useState(null);  // URL preview
    const [imageUploading, setImageUploading] = useState(false); // đang upload

    /**
     * Kiểm tra file hợp lệ trước khi upload.
     * Chỉ chấp nhận ảnh, tối đa 5MB.
     */
    const beforeUpload = (file) => {
        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            messageApi.error("Chỉ chấp nhận file ảnh (JPG, PNG, WEBP...)!");
            return Upload.LIST_IGNORE; // ngăn Antd add vào fileList
        }
        const isUnder5MB = file.size / 1024 / 1024 < 5;
        if (!isUnder5MB) {
            messageApi.error("Ảnh phải nhỏ hơn 5MB!");
            return Upload.LIST_IGNORE;
        }
        return true;
    };

    /**
     * customRequest: Ant Design gọi hàm này thay vì tự POST lên server.
     * Luồng:
     *   1. Gọi uploadImageApi (POST multipart/form-data)
     *   2. Nhận URL từ response.data.url
     *   3. Set imagePreview để hiện ảnh ngay lập tức
     *   4. addForm.setFieldValue("imageUrl", url) để field form có giá trị khi submit
     */
    const handleCustomUpload = async ({ file, onSuccess, onError }) => {
        setImageUploading(true);
        try {
            const result = await uploadImageApi(file, (percent) => {
                void percent; // có thể bind vào Progress bar sau
            });

            if (result.success) {
                // data là string URL thẳng: "http://localhost:8080/uploads/..."
                const url = result.data;
                setImagePreview(url);
                addForm.setFieldValue("imageUrl", url); // đồng bộ vào form field
                onSuccess(url);
                messageApi.success("Upload ảnh thành công!");
            } else {
                throw new Error(result.message || "Upload thất bại");
            }
        } catch (err) {
            onError(err);
            messageApi.error(
                err.response?.data?.message || err.message || "Upload ảnh thất bại!"
            );
        } finally {
            setImageUploading(false);
        }
    };

    // ── 1. Fetch lookup data khi mount ──────────────────────────
    useEffect(() => {
        const fetchLookupData = async () => {
            const [catResult, authorResult, publisherResult] = await Promise.allSettled([
                getCategoriesApi(),
                getAuthorsApi(),
                getPublishersApi(),
            ]);

            // Dữ liệu thật nằm ở response.data.content
            if (catResult.status === "fulfilled" && catResult.value.success) {
                setCategories(catResult.value.data?.content ?? []);
            }
            if (authorResult.status === "fulfilled" && authorResult.value.success) {
                setAuthors(authorResult.value.data?.content ?? []);
            }
            if (publisherResult.status === "fulfilled" && publisherResult.value.success) {
                setPublishers(publisherResult.value.data?.content ?? []);
            }
        };

        fetchLookupData();
    }, []);

    // ── 2. Fetch danh sách sách ──────────────────────────────────
    const fetchBooks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await searchBooksApi({
                page: currentPage,
                size: PAGE_SIZE,
                title: appliedFilters.title || undefined,
                categoryId: appliedFilters.categoryId || undefined,
                status: appliedFilters.status || undefined,
            });

            if (result.success) {
                setBooks((result.data?.content ?? []).filter(Boolean));
                setTotalElements(result.data?.totalElements ?? 0);
            } else {
                setError(result.message || "Không thể tải danh sách sách.");
                setBooks([]);
                setTotalElements(0);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Lỗi kết nối máy chủ. Vui lòng thử lại."
            );
            setBooks([]);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, appliedFilters]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    // ── 3. Search / filter handlers ──────────────────────────────

    const handleSearch = () => {
        setAppliedFilters((prev) => ({ ...prev, title: searchInput.trim() }));
        setCurrentPage(1);
    };

    const handleClearSearch = () => {
        setSearchInput("");
        setAppliedFilters((prev) => ({ ...prev, title: "" }));
        setCurrentPage(1);
    };

    const handleApplyFilter = () => {
        setAppliedFilters((prev) => ({
            ...prev,
            categoryId: pendingCategory,
            status: pendingStatus,
        }));
        setCurrentPage(1);
    };

    const handleResetAll = () => {
        setSearchInput("");
        setPendingCategory(undefined);
        setPendingStatus(undefined);
        setAppliedFilters({ title: "", categoryId: undefined, status: undefined });
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const hasActiveFilter =
        appliedFilters.title || appliedFilters.categoryId || appliedFilters.status;

    // ── 4. Xóa sách ─────────────────────────────────────────────

    /**
     * Gọi deleteBookApi → nếu thành công, refresh bảng.
     * Popconfirm đã yêu cầu xác nhận trước khi hàm này chạy.
     */
    const handleDelete = async (record) => {
        try {
            // Backend trả về 200/204 không có body → chỉ cần không throw là thành công
            await deleteBookApi(record.id);

            messageApi.success(`Đã xóa sách "${record.title}" thành công!`);

            // Nếu xóa hết trang hiện tại → lùi về trang trước
            const newTotal = totalElements - 1;
            const maxPage = Math.ceil(newTotal / PAGE_SIZE) || 1;
            if (currentPage > maxPage) {
                setCurrentPage(maxPage); // useEffect sẽ tự gọi fetchBooks
            } else {
                fetchBooks();
            }
        } catch (err) {
            messageApi.error(
                err.response?.data?.message ||
                "Lỗi kết nối máy chủ khi xóa sách."
            );
        }
    };

    // ── 5. Mở Modal Thêm sách mới ────────────────────────────────

    const handleOpenAddModal = () => {
        addForm.resetFields();
        setImagePreview(null);
        setModalMode("add");
        setCurrentBookId(null);
        setModalOpen(true);
    };

    // ── 6. Mở Modal Sửa sách ─────────────────────────────────────

    /**
     * Gọi getBookByIdApi để lấy dữ liệu đầy đủ.
     * Backend trả về object lồng nhau → phải map sang ID đơn lẻ
     * trước khi dùng form.setFieldsValue().
     */
    const handleOpenEditModal = async (record) => {
        // Đặt chế độ edit và lưu ID ngay để handleSubmit biết dùng API nào
        setModalMode("edit");
        setCurrentBookId(record.id);
        addForm.resetFields();
        setImagePreview(null); // sẽ set lại sau khi load xong API
        setModalOpen(true);

        try {
            const result = await getBookByIdApi(record.id);

            if (result.success) {
                const data = result.data;

                // ── Map object lồng nhau → ID đơn lẻ ──
                // Backend:  author: { id: 2, name: "..." }  →  authorId: 2
                // Backend:  publisher: { id: 1, name: "..." }  →  publisherId: 1
                // Backend:  categories: [{ id: 3, name: "..." }]  →  categoryIds: [3]
                addForm.setFieldsValue({
                    title: data.title,
                    isbn: data.isbn,
                    imageUrl: data.imageUrl ?? "",
                    publishYear: data.publishYear,
                    status: data.status,
                    authorId: data.author?.id,
                    publisherId: data.publisher?.id,
                    categoryIds: data.categories?.map((c) => c.id) ?? [],
                });
                // Hiển thị preview ảnh hiện tại của sách
                setImagePreview(data.imageUrl ?? null);
            } else {
                messageApi.error(result.message || "Không thể tải dữ liệu sách.");
                setModalOpen(false);
            }
        } catch (err) {
            messageApi.error(
                err.response?.data?.message ||
                "Lỗi kết nối khi tải chi tiết sách."
            );
            setModalOpen(false);
        }
    };

    // ── 7. Submit form (Thêm mới hoặc Cập nhật) ─────────────────

    /**
     * Ant Design validate trước → values luôn hợp lệ khi vào đây.
     * Dựa vào modalMode để gọi đúng API:
     *   "add"  → createBookApi(values)
     *   "edit" → updateBookApi(currentBookId, values)
     */
    const handleFormFinish = async (values) => {
        setSubmitting(true);

        // Chuẩn hóa payload — khớp đúng cấu trúc JSON Backend yêu cầu
        const payload = {
            title: values.title,
            isbn: values.isbn,
            imageUrl: values.imageUrl ?? "",
            publishYear: values.publishYear,
            status: values.status,
            authorId: values.authorId,
            publisherId: values.publisherId,
            categoryIds: values.categoryIds ?? [],
        };

        try {
            let result;

            if (modalMode === "add") {
                result = await createBookApi(payload);
            } else {
                // modalMode === "edit"
                result = await updateBookApi(currentBookId, payload);
            }

            if (result.success) {
                messageApi.success(
                    modalMode === "add"
                        ? "Thêm sách mới thành công!"
                        : "Cập nhật thông tin sách thành công!"
                );
                setModalOpen(false);
                addForm.resetFields();
                setCurrentBookId(null);

                // Thêm mới → về trang 1 để thấy sách mới nhất
                // Cập nhật → giữ nguyên trang hiện tại
                if (modalMode === "add") setCurrentPage(1);
                fetchBooks();
            } else {
                messageApi.error(
                    result.message ||
                    (modalMode === "add" ? "Thêm sách thất bại." : "Cập nhật thất bại.")
                );
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

    const handleViewDetail = (id) => navigate(`/admin/books/${id}`);

    // ── Cột bảng ────────────────────────────────────────────────
    const columns = [
        // ── Bìa sách ──
        {
            title: "BÌA SÁCH",
            dataIndex: "imageUrl",
            key: "imageUrl",
            width: 90,
            render: (url, record) => {
                const initials = (record.title ?? "?")
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase();

                const isPlaceholder =
                    !url || url === "string" || url.trim() === "";

                return isPlaceholder ? (
                    <div
                        className="book-avatar"
                        style={{
                            background: AVATAR_COLORS[record.id % AVATAR_COLORS.length],
                        }}
                    >
                        {initials}
                    </div>
                ) : (
                    <img
                        src={url}
                        alt={record.title}
                        className="book-thumb"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                );
            },
        },

        // ── Thông tin sách ──
        {
            title: "THÔNG TIN SÁCH",
            key: "info",
            width: 320,
            render: (_, r) => (
                <div className="book-info-cell">
                    <span
                        className="book-title-link"
                        onClick={() => handleViewDetail(r.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && handleViewDetail(r.id)}
                    >
                        {r.title}
                    </span>
                    <span className="book-isbn">ISBN: {r.isbn}</span>
                </div>
            ),
        },

        // ── Tác giả ──
        {
            title: "TÁC GIẢ",
            dataIndex: "author",
            key: "author",
            width: 180,
            render: (t) => <span className="cell-text">{t}</span>,
        },

        // ── Nhà xuất bản ──
        {
            title: "NHÀ XUẤT BẢN",
            dataIndex: "publisher",
            key: "publisher",
            width: 180,
            render: (t) => <span className="cell-text">{t}</span>,
        },

        // ── Số lượng ──
        {
            title: "SỐ LƯỢNG",
            key: "quantity",
            width: 120,
            align: "center",
            render: (_, r) => {
                const remaining = r.remainingQuantity ?? "?";
                const total = r.quantity ?? "?";
                const isLow = typeof remaining === "number" && typeof total === "number"
                    && total > 0 && remaining / total < 0.2; // < 20% → cảnh báo
                return (
                    <span className={`cell-quantity ${remaining === 0 ? "zero" : isLow ? "low" : ""}`}>
                        {remaining}
                        <span className="quantity-separator">/</span>
                        {total}
                    </span>
                );
            },
        },

        // ── Trạng thái ──
        {
            title: "TRẠNG THÁI",
            dataIndex: "status",
            key: "status",
            width: 150,
            align: "center",
            render: (status) => {
                const cfg = STATUS_MAP[status] ?? { label: status, color: "default" };
                return (
                    <Tag color={cfg.color} className="status-tag">
                        {cfg.label}
                    </Tag>
                );
            },
        },

        // ── Thao tác ──
        {
            title: "THAO TÁC",
            key: "actions",
            width: 120,
            align: "center",
            render: (_, record) => (
                <Space size={4}>
                    {/* Xem chi tiết */}
                    <Tooltip title="Xem chi tiết">
                        <button
                            className="action-btn view"
                            onClick={() => handleViewDetail(record.id)}
                        >
                            <EyeOutlined />
                        </button>
                    </Tooltip>

                    {/* Sửa — gọi API lấy chi tiết rồi mở modal */}
                    <Tooltip title="Chỉnh sửa">
                        <button
                            className="action-btn edit"
                            onClick={() => handleOpenEditModal(record)}
                        >
                            <EditOutlined />
                        </button>
                    </Tooltip>

                    {/* Xóa — yêu cầu xác nhận trước */}
                    <Tooltip title="Xóa sách">
                        <Popconfirm
                            title="Xác nhận xóa sách"
                            description={`Bạn chắc chắn muốn xóa "${record.title}"? Hành động này không thể hoàn tác.`}
                            onConfirm={() => handleDelete(record)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <button className="action-btn delete">
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
        <div className="bm-page">
            {contextHolder}

            {/* ── Page Header ── */}
            <div className="bm-header">
                <div>
                    <h1 className="bm-title">Quản lý đầu sách</h1>
                    <p className="bm-subtitle">
                        {loading
                            ? "Đang tải dữ liệu..."
                            : (
                                <>
                                    Tìm thấy{" "}
                                    <strong>{totalElements.toLocaleString("vi-VN")}</strong>{" "}
                                    đầu sách
                                </>
                            )
                        }
                    </p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className="bm-btn-add"
                    onClick={handleOpenAddModal}
                    size="large"
                >
                    Thêm sách mới
                </Button>
            </div>

            {/* ── Toolbar ── */}
            <div className="bm-toolbar">
                <Input
                    prefix={<SearchOutlined className="search-icon" />}
                    placeholder="Tìm kiếm tên sách, tác giả, ISBN..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onPressEnter={handleSearch}
                    onClear={handleClearSearch}
                    allowClear
                    size="large"
                    className="bm-search"
                />
                <Button
                    icon={<FilterOutlined />}
                    size="large"
                    className={`bm-btn-filter ${showFilter ? "is-active" : ""}`}
                    onClick={() => setShowFilter((v) => !v)}
                >
                    Lọc dữ liệu
                </Button>
                <Button
                    type="primary"
                    size="large"
                    className="bm-btn-search-submit"
                    onClick={handleSearch}
                    loading={loading}
                >
                    Tìm kiếm
                </Button>
            </div>

            {/* ── Filter Panel ── */}
            {showFilter && (
                <div className="bm-filter-panel">
                    <Select
                        placeholder="Thể loại"
                        allowClear
                        value={pendingCategory}
                        onChange={setPendingCategory}
                        size="large"
                        className="filter-select"
                    >
                        {categories.map((c) => (
                            <Option key={c.id} value={c.id}>{c.name}</Option>
                        ))}
                    </Select>

                    <Select
                        placeholder="Trạng thái"
                        allowClear
                        value={pendingStatus}
                        onChange={setPendingStatus}
                        size="large"
                        className="filter-select"
                    >
                        <Option value="AVAILABLE">Sẵn có</Option>
                        <Option value="OUT_OF_STOCK">Hết hàng</Option>
                        <Option value="DISCONTINUED">Ngừng cung cấp</Option>
                    </Select>

                    <Button
                        type="primary"
                        size="large"
                        className="bm-btn-apply"
                        onClick={handleApplyFilter}
                    >
                        Áp dụng
                    </Button>

                    {hasActiveFilter && (
                        <Button size="large" onClick={handleResetAll}>
                            Xóa bộ lọc
                        </Button>
                    )}

                    {!loading && (
                        <span className="filter-count">
                            Tìm thấy{" "}
                            <strong>{totalElements.toLocaleString("vi-VN")}</strong>{" "}
                            kết quả
                        </span>
                    )}
                </div>
            )}

            {/* ── Thông báo lỗi ── */}
            {error && (
                <Alert
                    message="Không thể tải dữ liệu"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError(null)}
                    style={{ marginBottom: 16 }}
                    action={
                        <Button size="small" onClick={fetchBooks}>
                            Thử lại
                        </Button>
                    }
                />
            )}

            {/* ── Data Table ── */}
            <div className="bm-table-wrap">
                <Spin spinning={loading} size="large">
                    <Table
                        columns={columns}
                        dataSource={books}
                        rowKey={(r) => r.id ?? r.isbn ?? Math.random()}
                        className="bm-table"
                        pagination={{
                            current: currentPage,
                            pageSize: PAGE_SIZE,
                            total: totalElements,
                            onChange: handlePageChange,
                            showSizeChanger: false,
                            position: ["bottomCenter"],
                            showTotal: (total, range) =>
                                `${range[0]}–${range[1]} / ${total} đầu sách`,
                        }}
                        locale={{
                            emptyText: loading ? " " : "Không tìm thấy sách nào phù hợp.",
                        }}
                    />
                </Spin>
            </div>

            {/* ── Modal Thêm / Sửa sách ── */}
            <Modal
                title={
                    modalMode === "add"
                        ? "Thêm sách mới"
                        : "Cập nhật thông tin sách"
                }
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    addForm.resetFields();
                    setCurrentBookId(null);
                    setImagePreview(null);
                }}
                footer={null}
                width={660}
                destroyOnClose
                className="add-book-modal"
            >
                <Form
                    form={addForm}
                    layout="vertical"
                    onFinish={handleFormFinish}
                    requiredMark={false}
                    className="add-book-form"
                >
                    {/* Tiêu đề sách */}
                    <Form.Item
                        label="Tiêu đề sách"
                        name="title"
                        rules={[{ required: true, message: "Vui lòng nhập tiêu đề sách!" }]}
                    >
                        <Input
                            placeholder="VD: Kinh tế học vi mô"
                            size="large"
                        />
                    </Form.Item>

                    {/* ISBN + Năm xuất bản */}
                    <div className="form-row-2">
                        <Form.Item
                            label="Mã ISBN"
                            name="isbn"
                            rules={[{ required: true, message: "Vui lòng nhập ISBN!" }]}
                        >
                            <Input
                                placeholder="VD: 978-3-16-148410-0"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Năm xuất bản"
                            name="publishYear"
                            rules={[{ required: true, message: "Vui lòng nhập năm!" }]}
                        >
                            <InputNumber
                                placeholder="VD: 2024"
                                min={1900}
                                max={new Date().getFullYear() + 1}
                                style={{ width: "100%" }}
                                size="large"
                            />
                        </Form.Item>
                    </div>

                    {/* Ảnh bìa sách — Upload + Preview */}
                    <Form.Item
                        label="Ảnh bìa sách"
                        name="imageUrl"
                    >
                        <div className="image-upload-wrapper">
                            {/* Vùng preview ảnh */}
                            <div className="image-preview-box">
                                {imageUploading ? (
                                    <div className="image-preview-loading">
                                        <LoadingOutlined style={{ fontSize: 28, color: "#0d2461" }} />
                                        <span>Đang upload...</span>
                                    </div>
                                ) : imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Ảnh bìa"
                                        className="image-preview-img"
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                "https://placehold.co/120x160/c8d8f0/0d2461?text=Lỗi+ảnh";
                                        }}
                                    />
                                ) : (
                                    <div className="image-preview-empty">
                                        <UploadOutlined style={{ fontSize: 24, color: "#94a3b8" }} />
                                        <span>Chưa có ảnh</span>
                                    </div>
                                )}
                            </div>

                            {/* Nút Upload + Input URL thủ công */}
                            <div className="image-upload-controls">
                                <Upload
                                    accept="image/*"
                                    showUploadList={false}
                                    beforeUpload={beforeUpload}
                                    customRequest={handleCustomUpload}
                                    disabled={imageUploading}
                                >
                                    <Button
                                        icon={imageUploading ? <LoadingOutlined /> : <UploadOutlined />}
                                        disabled={imageUploading}
                                        size="large"
                                        style={{ width: "100%" }}
                                    >
                                        {imageUploading ? "Đang upload..." : "Chọn ảnh từ máy"}
                                    </Button>
                                </Upload>

                                {/* Hoặc nhập URL thủ công */}
                                <Input
                                    placeholder="Hoặc nhập URL ảnh trực tiếp..."
                                    size="large"
                                    value={imagePreview ?? ""}
                                    onChange={(e) => {
                                        const url = e.target.value;
                                        setImagePreview(url || null);
                                        addForm.setFieldValue("imageUrl", url);
                                    }}
                                />

                                {/* Nút xóa ảnh */}
                                {imagePreview && (
                                    <Button
                                        danger
                                        size="large"
                                        style={{ width: "100%" }}
                                        onClick={() => {
                                            setImagePreview(null);
                                            addForm.setFieldValue("imageUrl", "");
                                        }}
                                    >
                                        Xóa ảnh
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Form.Item>

                    {/* Tác giả + NXB */}
                    <div className="form-row-2">
                        <Form.Item
                            label="Tác giả"
                            name="authorId"
                            rules={[{ required: true, message: "Vui lòng chọn tác giả!" }]}
                        >
                            <Select
                                placeholder="Chọn tác giả"
                                size="large"
                                showSearch
                                filterOption={(input, opt) =>
                                    opt.children.toLowerCase().includes(input.toLowerCase())
                                }
                                notFoundContent="Không tìm thấy tác giả"
                            >
                                {authors.map((a) => (
                                    <Option key={a.id} value={a.id}>
                                        {a.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Nhà xuất bản"
                            name="publisherId"
                            rules={[{ required: true, message: "Vui lòng chọn NXB!" }]}
                        >
                            <Select
                                placeholder="Chọn nhà xuất bản"
                                size="large"
                                showSearch
                                filterOption={(input, opt) =>
                                    opt.children.toLowerCase().includes(input.toLowerCase())
                                }
                                notFoundContent="Không tìm thấy NXB"
                            >
                                {publishers.map((p) => (
                                    <Option key={p.id} value={p.id}>
                                        {p.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    {/* Thể loại (multi-select) */}
                    <Form.Item
                        label="Thể loại"
                        name="categoryIds"
                        rules={[{
                            required: true,
                            message: "Vui lòng chọn ít nhất 1 thể loại!",
                        }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Chọn thể loại (có thể chọn nhiều)"
                            size="large"
                            allowClear
                            notFoundContent="Không tìm thấy thể loại"
                        >
                            {categories.map((c) => (
                                <Option key={c.id} value={c.id}>
                                    {c.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Trạng thái */}
                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        initialValue="AVAILABLE"
                        rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
                    >
                        <Select size="large">
                            <Option value="AVAILABLE">Sẵn có</Option>
                            <Option value="OUT_OF_STOCK">Hết hàng</Option>
                            <Option value="DISCONTINUED">Ngừng cung cấp</Option>
                        </Select>
                    </Form.Item>

                    {/* Footer: Hủy + Submit */}
                    <div className="form-footer">
                        <Button
                            size="large"
                            onClick={() => {
                                setModalOpen(false);
                                addForm.resetFields();
                                setCurrentBookId(null);
                            }}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            size="large"
                            className="bm-btn-add"
                        >
                            {modalMode === "add" ? "Thêm sách" : "Lưu thay đổi"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default BookManagement;