// ============================================================
// src/pages/AuthorManagement/Index.jsx
// Trang Quản lý Tác giả — API thật, phân trang server-side.
//
// State flow:
//   searchText    → controlled input (gõ chữ, chưa submit)
//   searchQuery   → từ khóa đã xác nhận → trigger fetchAuthors
//   currentPage   → trang hiện tại (1-indexed, đồng bộ BE)
//   modalMode     → "add" | "edit"
// ============================================================

import React, { useState, useEffect, useCallback } from "react";
import {
    Table, Input, Button, Space, Tooltip, Popconfirm,
    Modal, Form, Spin, Alert, message,
} from "antd";
import {
    PlusOutlined, SearchOutlined,
    EditOutlined, DeleteOutlined,
} from "@ant-design/icons";
import {
    getAuthorsApi,
    createAuthorApi,
    updateAuthorApi,
    deleteAuthorApi,
} from "../../services/authorService";
import "./AuthorManagement.css";

const PAGE_SIZE = 10;

// ── Component chính ───────────────────────────────────────────
const AuthorManagement = () => {
    const [messageApi, contextHolder] = message.useMessage();

    // ── Data states ───────────────────────────────────────────
    const [authors, setAuthors] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ── Search states ─────────────────────────────────────────
    const [searchText, setSearchText] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // ── Pagination ────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);

    // ── Modal states ──────────────────────────────────────────
    const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [authorForm] = Form.useForm();

    // ── Fetch danh sách tác giả ──────────────────────────────
    /**
     * BE đã cấu hình one-indexed → truyền thẳng currentPage, không trừ 1.
     * Nếu có searchQuery → lọc client-side trên kết quả trả về
     * (hoặc thay bằng param `search` nếu BE hỗ trợ sau này).
     */
    const fetchAuthors = useCallback(async (page, name) => {
        setLoading(true);
        setError(null);
        try {
            const result = await getAuthorsApi(page, PAGE_SIZE, name);
            if (result.success) {
                setAuthors(result.data?.content ?? []);
                setTotalElements(result.data?.totalElements ?? 0);
            } else {
                setError(result.message || "Không thể tải danh sách tác giả.");
                setAuthors([]);
                setTotalElements(0);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Lỗi kết nối máy chủ. Vui lòng thử lại."
            );
            setAuthors([]);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAuthors(currentPage, searchQuery);
    }, [currentPage, searchQuery, fetchAuthors]);

    // ── Handlers ─────────────────────────────────────────────

    /** Enter hoặc click Search → xác nhận query, reset trang 1 */
    const handleSearch = () => {
        setSearchQuery(searchText.trim());
        setCurrentPage(1);
    };

    const handleClearSearch = () => {
        setSearchText("");
        setSearchQuery("");
        setCurrentPage(1);
    };

    /** Chuyển trang */
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    /** Mở modal Thêm mới */
    const handleOpenAdd = () => {
        authorForm.resetFields();
        setModalMode("add");
        setEditingId(null);
        setModalOpen(true);
    };

    /** Mở modal Sửa — điền sẵn dữ liệu từ row */
    const handleOpenEdit = (record) => {
        authorForm.setFieldsValue({
            name: record.name,
            description: record.description,
        });
        setModalMode("edit");
        setEditingId(record.id);
        setModalOpen(true);
    };

    /** Đóng modal */
    const handleCloseModal = () => {
        setModalOpen(false);
        authorForm.resetFields();
        setEditingId(null);
    };

    /**
     * Submit form Thêm / Sửa.
     * Ant Design validate trước → values luôn hợp lệ khi vào đây.
     */
    const handleFormFinish = async (values) => {
        setSubmitting(true);
        try {
            let result;
            if (modalMode === "add") {
                result = await createAuthorApi({
                    name: values.name,
                    description: values.description ?? "",
                });
            } else {
                result = await updateAuthorApi(editingId, {
                    name: values.name,
                    description: values.description ?? "",
                });
            }

            if (result.success) {
                messageApi.success(
                    modalMode === "add"
                        ? "Thêm tác giả thành công!"
                        : "Cập nhật tác giả thành công!"
                );
                handleCloseModal();
                // Cả thêm mới lẫn sửa đều reload lại trang hiện tại
                // (thêm mới cũng giữ trang 1 nếu đang ở trang 1, hoặc về trang 1)
                if (modalMode === "add") {
                    // Nếu đang ở trang 1 → currentPage không đổi → useEffect không tự chạy
                    // → gọi fetchAuthors trực tiếp để reload ngay
                    if (currentPage === 1) {
                        fetchAuthors(1, searchQuery);
                    } else {
                        setCurrentPage(1); // useEffect tự gọi fetchAuthors
                    }
                } else {
                    fetchAuthors(currentPage, searchQuery);
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
     * Xóa tác giả.
     * BE trả 200/204 không có body → không check success, chỉ cần không throw.
     */
    const handleDelete = async (record) => {
        try {
            await deleteAuthorApi(record.id);
            messageApi.success(`Đã xóa tác giả "${record.name}" thành công!`);
            const newTotal = totalElements - 1;
            const maxPage = Math.ceil(newTotal / PAGE_SIZE) || 1;
            if (currentPage > maxPage) {
                setCurrentPage(maxPage);
            } else {
                fetchAuthors(currentPage, searchQuery);
            }
        } catch (err) {
            messageApi.error(
                err.response?.data?.message ||
                "Lỗi khi xóa tác giả. Vui lòng thử lại."
            );
        }
    };

    // ── Cột bảng ─────────────────────────────────────────────
    const columns = [
        {
            title: "STT",
            key: "stt",
            width: 64,
            align: "center",
            render: (_, __, index) => (
                <span className="cell-stt">
                    {(currentPage - 1) * PAGE_SIZE + index + 1}
                </span>
            ),
        },
        {
            title: "TÊN TÁC GIẢ",
            dataIndex: "name",
            key: "name",
            width: 220,
            render: (text) => <span className="author-name-text">{text}</span>,
        },
        {
            // Trường BE: description (không phải bio)
            title: "GIỚI THIỆU",
            dataIndex: "description",
            key: "description",
            render: (text) => (
                <span className="author-bio-text">
                    {text || <span className="cell-empty">Chưa có giới thiệu</span>}
                </span>
            ),
        },
        {
            title: "THAO TÁC",
            key: "actions",
            width: 110,
            align: "center",
            render: (_, record) => (
                <Space size={4}>
                    <Tooltip title="Chỉnh sửa">
                        <button
                            className="action-btn edit"
                            onClick={() => handleOpenEdit(record)}
                        >
                            <EditOutlined />
                        </button>
                    </Tooltip>

                    <Tooltip title="Xóa tác giả">
                        <Popconfirm
                            title="Xác nhận xóa tác giả"
                            description={`Bạn chắc chắn muốn xóa "${record.name}"?`}
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
        <div className="am-page">
            {contextHolder}

            {/* ── Page Header ── */}
            <div className="am-header">
                <div>
                    <h1 className="am-title">Quản lý tác giả</h1>
                    <p className="am-subtitle">
                        {loading
                            ? "Đang tải dữ liệu..."
                            : <>Tổng cộng <strong>{totalElements.toLocaleString("vi-VN")}</strong> tác giả</>
                        }
                    </p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className="am-btn-add"
                    onClick={handleOpenAdd}
                    size="large"
                >
                    Thêm tác giả
                </Button>
            </div>

            {/* ── Toolbar: Search ── */}
            <div className="am-toolbar">
                <Input
                    prefix={<SearchOutlined className="search-icon" />}
                    placeholder="Tìm kiếm tên tác giả, giới thiệu... (Enter để tìm)"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={handleSearch}
                    onClear={handleClearSearch}
                    allowClear
                    size="large"
                    className="am-search"
                />
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
                    style={{ marginBottom: 16 }}
                    action={
                        <Button size="small" onClick={() => fetchAuthors(currentPage, searchQuery)}>
                            Thử lại
                        </Button>
                    }
                />
            )}

            {/* ── Table ── */}
            <div className="am-table-wrap">
                <Spin spinning={loading} size="large">
                    <Table
                        columns={columns}
                        dataSource={authors}
                        rowKey="id"
                        className="am-table"
                        loading={false}
                        pagination={{
                            current: currentPage,
                            pageSize: PAGE_SIZE,
                            total: totalElements,
                            onChange: handlePageChange,
                            showSizeChanger: false,
                            position: ["bottomCenter"],
                            showTotal: (total, range) =>
                                `${range[0]}–${range[1]} / ${total} tác giả`,
                        }}
                        locale={{
                            emptyText: loading ? " " : "Không tìm thấy tác giả nào.",
                        }}
                    />
                </Spin>
            </div>

            {/* ── Modal Thêm / Sửa tác giả ── */}
            <Modal
                title={modalMode === "add" ? "Thêm tác giả mới" : "Chỉnh sửa tác giả"}
                open={modalOpen}
                onCancel={handleCloseModal}
                footer={null}
                width={520}
                destroyOnClose
                className="author-modal"
            >
                <Form
                    form={authorForm}
                    layout="vertical"
                    onFinish={handleFormFinish}
                    requiredMark={false}
                    className="author-form"
                >
                    {/* Tên tác giả */}
                    <Form.Item
                        label="Tên tác giả"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên tác giả!" }]}
                    >
                        <Input
                            placeholder="VD: Nguyễn Nhật Ánh"
                            size="large"
                        />
                    </Form.Item>

                    {/* Giới thiệu — field BE: description */}
                    <Form.Item
                        label="Giới thiệu"
                        name="description"
                    >
                        <Input.TextArea
                            placeholder="Mô tả ngắn về tác giả..."
                            rows={4}
                            size="large"
                            showCount
                            maxLength={500}
                            style={{ resize: "none" }}
                        />
                    </Form.Item>

                    {/* Footer */}
                    <div className="form-footer">
                        <Button size="large" onClick={handleCloseModal}>
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            size="large"
                            className="am-btn-add"
                        >
                            {modalMode === "add" ? "Thêm tác giả" : "Lưu thay đổi"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default AuthorManagement;