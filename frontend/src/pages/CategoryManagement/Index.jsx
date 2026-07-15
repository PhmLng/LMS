// ============================================================
// src/pages/CategoryManagement/Index.jsx
// Trang Quản lý Thể loại — API thật, phân trang server-side.
// Phong cách: đồng nhất với Author/PublisherManagement.
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
    getCategoriesApi,
    createCategoryApi,
    updateCategoryApi,
    deleteCategoryApi,
} from "../../services/categoryService";
import "./CategoryManagement.css";

const PAGE_SIZE = 10;

const CategoryManagement = () => {
    const [messageApi, contextHolder] = message.useMessage();

    // ── Data states ───────────────────────────────────────────
    const [categories, setCategories] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ── Search states ─────────────────────────────────────────
    const [searchText, setSearchText] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // ── Pagination ────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);

    // ── Modal states ──────────────────────────────────────────
    const [modalMode, setModalMode] = useState("add");
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [catForm] = Form.useForm();

    // ── Fetch ─────────────────────────────────────────────────
    const fetchCategories = useCallback(async (page, name) => {
        setLoading(true);
        setError(null);
        try {
            const result = await getCategoriesApi(page, PAGE_SIZE, name);
            if (result.success) {
                setCategories(result.data?.content ?? []);
                setTotalElements(result.data?.totalElements ?? 0);
            } else {
                setError(result.message || "Không thể tải danh sách thể loại.");
                setCategories([]);
                setTotalElements(0);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi kết nối máy chủ. Vui lòng thử lại.");
            setCategories([]);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories(currentPage, searchQuery);
    }, [currentPage, searchQuery, fetchCategories]);

    // ── Handlers ─────────────────────────────────────────────

    const handleSearch = () => {
        setSearchQuery(searchText.trim());
        setCurrentPage(1);
    };

    const handleClearSearch = () => {
        setSearchText("");
        setSearchQuery("");
        setCurrentPage(1);
    };

    const handleOpenAdd = () => {
        catForm.resetFields();
        setModalMode("add");
        setEditingId(null);
        setModalOpen(true);
    };

    const handleOpenEdit = (record) => {
        catForm.setFieldsValue({ name: record.name, description: record.description });
        setModalMode("edit");
        setEditingId(record.id);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        catForm.resetFields();
        setEditingId(null);
    };

    const handleFormFinish = async (values) => {
        setSubmitting(true);
        try {
            const payload = { name: values.name, description: values.description ?? "" };
            const result = modalMode === "add"
                ? await createCategoryApi(payload)
                : await updateCategoryApi(editingId, payload);

            if (result.success) {
                messageApi.success(
                    modalMode === "add" ? "Thêm thể loại thành công!" : "Cập nhật thể loại thành công!"
                );
                handleCloseModal();
                if (modalMode === "add") {
                    // Đang ở trang 1 → state không đổi → gọi fetch trực tiếp
                    if (currentPage === 1) fetchCategories(1, searchQuery);
                    else setCurrentPage(1);
                } else {
                    fetchCategories(currentPage, searchQuery);
                }
            } else {
                messageApi.error(result.message || "Thao tác thất bại. Vui lòng thử lại.");
            }
        } catch (err) {
            messageApi.error(err.response?.data?.message || "Lỗi kết nối máy chủ.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (record) => {
        try {
            await deleteCategoryApi(record.id);
            messageApi.success(`Đã xóa thể loại "${record.name}" thành công!`);
            const maxPage = Math.ceil((totalElements - 1) / PAGE_SIZE) || 1;
            if (currentPage > maxPage) setCurrentPage(maxPage);
            else fetchCategories(currentPage, searchQuery);
        } catch (err) {
            messageApi.error(err.response?.data?.message || "Lỗi khi xóa thể loại.");
        }
    };

    // ── Cột bảng ─────────────────────────────────────────────
    const columns = [
        {
            title: "STT",
            key: "stt",
            width: 64,
            align: "center",
            render: (_, __, i) => (
                <span className="cell-stt">{(currentPage - 1) * PAGE_SIZE + i + 1}</span>
            ),
        },
        {
            title: "TÊN THỂ LOẠI",
            dataIndex: "name",
            key: "name",
            width: 220,
            render: (text) => <span className="cat-name-text">{text}</span>,
        },
        {
            title: "MÔ TẢ",
            dataIndex: "description",
            key: "description",
            render: (text) => (
                <span className="cat-desc-text">
                    {text || <span className="cell-empty">Chưa có mô tả</span>}
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
                        <button className="action-btn edit" onClick={() => handleOpenEdit(record)}>
                            <EditOutlined />
                        </button>
                    </Tooltip>
                    <Tooltip title="Xóa thể loại">
                        <Popconfirm
                            title="Xác nhận xóa thể loại"
                            description={`Bạn chắc chắn muốn xóa "${record.name}"?`}
                            onConfirm={() => handleDelete(record)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <button className="action-btn delete"><DeleteOutlined /></button>
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // ── Render ────────────────────────────────────────────────
    return (
        <div className="cm-page">
            {contextHolder}

            {/* Header */}
            <div className="cm-header">
                <div>
                    <h1 className="cm-title">Quản lý thể loại</h1>
                    <p className="cm-subtitle">
                        {loading
                            ? "Đang tải dữ liệu..."
                            : <>Tổng cộng <strong>{totalElements.toLocaleString("vi-VN")}</strong> thể loại</>
                        }
                    </p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className="cm-btn-add"
                    onClick={handleOpenAdd}
                    size="large"
                >
                    Thêm thể loại
                </Button>
            </div>

            {/* Toolbar */}
            <div className="cm-toolbar">
                <Input
                    prefix={<SearchOutlined className="search-icon" />}
                    placeholder="Tìm kiếm tên thể loại... (Enter để tìm)"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={handleSearch}
                    onClear={handleClearSearch}
                    allowClear
                    size="large"
                    className="cm-search"
                />
            </div>

            {/* Lỗi */}
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
                        <Button size="small" onClick={() => fetchCategories(currentPage, searchQuery)}>
                            Thử lại
                        </Button>
                    }
                />
            )}

            {/* Table */}
            <div className="cm-table-wrap">
                <Spin spinning={loading} size="large">
                    <Table
                        columns={columns}
                        dataSource={categories}
                        rowKey="id"
                        className="cm-table"
                        loading={false}
                        pagination={{
                            current: currentPage,
                            pageSize: PAGE_SIZE,
                            total: totalElements,
                            onChange: (page) => setCurrentPage(page),
                            showSizeChanger: false,
                            position: ["bottomCenter"],
                            showTotal: (total, range) => `${range[0]}–${range[1]} / ${total} thể loại`,
                        }}
                        locale={{ emptyText: loading ? " " : "Không tìm thấy thể loại nào." }}
                    />
                </Spin>
            </div>

            {/* Modal Thêm / Sửa */}
            <Modal
                title={modalMode === "add" ? "Thêm thể loại mới" : "Chỉnh sửa thể loại"}
                open={modalOpen}
                onCancel={handleCloseModal}
                footer={null}
                width={500}
                destroyOnClose
                className="cat-modal"
            >
                <Form
                    form={catForm}
                    layout="vertical"
                    onFinish={handleFormFinish}
                    requiredMark={false}
                    className="cat-form"
                >
                    <Form.Item
                        label="Tên thể loại"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên thể loại!" }]}
                    >
                        <Input placeholder="VD: Trinh thám, Kinh tế, Kỹ thuật..." size="large" />
                    </Form.Item>

                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea
                            placeholder="Mô tả về thể loại này..."
                            rows={4}
                            size="large"
                            showCount
                            maxLength={500}
                            style={{ resize: "none" }}
                        />
                    </Form.Item>

                    <div className="form-footer">
                        <Button size="large" onClick={handleCloseModal}>Hủy</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            size="large"
                            className="cm-btn-add"
                        >
                            {modalMode === "add" ? "Thêm thể loại" : "Lưu thay đổi"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoryManagement;