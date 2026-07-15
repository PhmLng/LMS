// ============================================================
// src/pages/PublisherManagement/Index.jsx
// Trang Quản lý Nhà xuất bản — API thật, phân trang server-side.
//
// Phong cách: đồng nhất với AuthorManagement & BookManagement.
//
// State flow:
//   searchText    → controlled input (gõ chữ, chưa submit)
//   searchQuery   → từ khóa đã xác nhận → trigger fetchPublishers
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
    getPublishersApi,
    createPublisherApi,
    updatePublisherApi,
    deletePublisherApi,
} from "../../services/publisherService";
import "./PublisherManagement.css";

const PAGE_SIZE = 10;

// ── Component chính ───────────────────────────────────────────
const PublisherManagement = () => {
    const [messageApi, contextHolder] = message.useMessage();

    // ── Data states ───────────────────────────────────────────
    const [publishers, setPublishers] = useState([]);
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
    const [pubForm] = Form.useForm();

    // ── Fetch danh sách NXB ──────────────────────────────────
    /**
     * BE đã cấu hình one-indexed → truyền thẳng page, không trừ 1.
     * param search truyền thẳng lên API ?search=... để BE lọc.
     */
    const fetchPublishers = useCallback(async (page, search) => {
        setLoading(true);
        setError(null);
        try {
            const result = await getPublishersApi(page, PAGE_SIZE, search);
            if (result.success) {
                setPublishers(result.data?.content ?? []);
                setTotalElements(result.data?.totalElements ?? 0);
            } else {
                setError(result.message || "Không thể tải danh sách nhà xuất bản.");
                setPublishers([]);
                setTotalElements(0);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Lỗi kết nối máy chủ. Vui lòng thử lại."
            );
            setPublishers([]);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    }, []);

    // Trigger khi đổi trang hoặc đổi searchQuery
    useEffect(() => {
        fetchPublishers(currentPage, searchQuery);
    }, [currentPage, searchQuery, fetchPublishers]);

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
        pubForm.resetFields();
        setModalMode("add");
        setEditingId(null);
        setModalOpen(true);
    };

    /** Mở modal Sửa — điền sẵn dữ liệu từ row */
    const handleOpenEdit = (record) => {
        pubForm.setFieldsValue({
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
        pubForm.resetFields();
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
                result = await createPublisherApi({
                    name: values.name,
                    description: values.description ?? "",
                });
            } else {
                result = await updatePublisherApi(editingId, {
                    name: values.name,
                    description: values.description ?? "",
                });
            }

            if (result.success) {
                messageApi.success(
                    modalMode === "add"
                        ? "Thêm nhà xuất bản thành công!"
                        : "Cập nhật nhà xuất bản thành công!"
                );
                handleCloseModal();

                if (modalMode === "add") {
                    // Đang ở trang 1 → state không đổi → gọi fetch trực tiếp
                    if (currentPage === 1) {
                        fetchPublishers(1, searchQuery);
                    } else {
                        setCurrentPage(1); // useEffect tự gọi fetchPublishers
                    }
                } else {
                    fetchPublishers(currentPage, searchQuery);
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
     * Xóa NXB.
     * BE trả 200/204 không có body → chỉ cần không throw là thành công.
     */
    const handleDelete = async (record) => {
        try {
            await deletePublisherApi(record.id);
            messageApi.success(`Đã xóa nhà xuất bản "${record.name}" thành công!`);
            const newTotal = totalElements - 1;
            const maxPage = Math.ceil(newTotal / PAGE_SIZE) || 1;
            if (currentPage > maxPage) {
                setCurrentPage(maxPage); // useEffect tự gọi fetchPublishers
            } else {
                fetchPublishers(currentPage, searchQuery);
            }
        } catch (err) {
            messageApi.error(
                err.response?.data?.message ||
                "Lỗi khi xóa nhà xuất bản. Vui lòng thử lại."
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
            title: "TÊN NHÀ XUẤT BẢN",
            dataIndex: "name",
            key: "name",
            width: 260,
            render: (text) => <span className="pub-name-text">{text}</span>,
        },
        {
            title: "GIỚI THIỆU",
            dataIndex: "description",
            key: "description",
            render: (text) => (
                <span className="pub-desc-text">
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

                    <Tooltip title="Xóa nhà xuất bản">
                        <Popconfirm
                            title="Xác nhận xóa nhà xuất bản"
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
        <div className="pm-page">
            {contextHolder}

            {/* ── Page Header ── */}
            <div className="pm-header">
                <div>
                    <h1 className="pm-title">Quản lý nhà xuất bản</h1>
                    <p className="pm-subtitle">
                        {loading
                            ? "Đang tải dữ liệu..."
                            : <>Tổng cộng <strong>{totalElements.toLocaleString("vi-VN")}</strong> nhà xuất bản</>
                        }
                    </p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className="pm-btn-add"
                    onClick={handleOpenAdd}
                    size="large"
                >
                    Thêm nhà xuất bản
                </Button>
            </div>

            {/* ── Toolbar: Search ── */}
            <div className="pm-toolbar">
                <Input
                    prefix={<SearchOutlined className="search-icon" />}
                    placeholder="Tìm kiếm tên nhà xuất bản... (Enter để tìm)"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={handleSearch}
                    onClear={handleClearSearch}
                    allowClear
                    size="large"
                    className="pm-search"
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
                        <Button size="small" onClick={() => fetchPublishers(currentPage, searchQuery)}>
                            Thử lại
                        </Button>
                    }
                />
            )}

            {/* ── Table ── */}
            <div className="pm-table-wrap">
                <Spin spinning={loading} size="large">
                    <Table
                        columns={columns}
                        dataSource={publishers}
                        rowKey="id"
                        className="pm-table"
                        loading={false}
                        pagination={{
                            current: currentPage,
                            pageSize: PAGE_SIZE,
                            total: totalElements,
                            onChange: handlePageChange,
                            showSizeChanger: false,
                            position: ["bottomCenter"],
                            showTotal: (total, range) =>
                                `${range[0]}–${range[1]} / ${total} nhà xuất bản`,
                        }}
                        locale={{
                            emptyText: loading ? " " : "Không tìm thấy nhà xuất bản nào.",
                        }}
                    />
                </Spin>
            </div>

            {/* ── Modal Thêm / Sửa NXB ── */}
            <Modal
                title={modalMode === "add" ? "Thêm nhà xuất bản mới" : "Chỉnh sửa nhà xuất bản"}
                open={modalOpen}
                onCancel={handleCloseModal}
                footer={null}
                width={520}
                destroyOnClose
                className="pub-modal"
            >
                <Form
                    form={pubForm}
                    layout="vertical"
                    onFinish={handleFormFinish}
                    requiredMark={false}
                    className="pub-form"
                >
                    {/* Tên NXB */}
                    <Form.Item
                        label="Tên nhà xuất bản"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên nhà xuất bản!" }]}
                    >
                        <Input
                            placeholder="VD: NXB Kim Đồng"
                            size="large"
                        />
                    </Form.Item>

                    {/* Giới thiệu */}
                    <Form.Item
                        label="Giới thiệu"
                        name="description"
                    >
                        <Input.TextArea
                            placeholder="Mô tả ngắn về nhà xuất bản..."
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
                            className="pm-btn-add"
                        >
                            {modalMode === "add" ? "Thêm nhà xuất bản" : "Lưu thay đổi"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default PublisherManagement;