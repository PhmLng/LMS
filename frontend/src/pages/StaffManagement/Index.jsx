// ============================================================
// src/pages/StaffManagement/StaffManagement.jsx
// Trang Quản lý nhân sự — API thật, phân trang server-side.
//
// Chỉ hiển thị trên sidebar khi role = ADMIN (đã xử lý ở AdminLayout).
//
// Endpoint:
//   GET  /staffs?page=&size=&role=
//   GET  /staffs/search?name=
//   POST /staffs
//   PUT  /staffs/{id}
//   PUT  /staffs/{id}/lock
//   PUT  /staffs/{id}/unlock
// ============================================================

import React, { useState, useEffect, useCallback } from "react";
import {
    Table, Input, Button, Select, Tag,
    Switch, Tooltip, Modal, Form, Divider,
    Row, Col, message,
} from "antd";
import {
    UserAddOutlined, EditOutlined, SearchOutlined,
    UserOutlined, LockOutlined,
} from "@ant-design/icons";
import {
    getStaffsApi, searchStaffsApi,
    createStaffApi, updateStaffApi,
    lockStaffApi, unlockStaffApi,
} from "../../services/staffService";
import "./StaffManagement.css";

// ── Hằng số ───────────────────────────────────────────────────
const PAGE_SIZE = 10;

const ROLE_CONFIG = {
    ADMIN: { label: "Quản trị viên", color: "gold" },
    LIBRARIAN: { label: "Thủ thư", color: "blue" },
};

// ── Component chính ───────────────────────────────────────────
const StaffManagement = () => {
    const [messageApi, contextHolder] = message.useMessage();

    // ── Data states ───────────────────────────────────────────
    const [dataSource, setDataSource] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);

    // ── Filter / Search ───────────────────────────────────────
    const [searchText, setSearchText] = useState("");
    const [searchQuery, setSearchQuery] = useState(""); // đã xác nhận → trigger
    const [filterRole, setFilterRole] = useState("ALL");
    const [isSearchMode, setIsSearchMode] = useState(false); // đang dùng /search hay /staffs

    // ── Pagination ────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);

    // ── Modal states ──────────────────────────────────────────
    const [modalMode, setModalMode] = useState("add");
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [staffForm] = Form.useForm();

    // ── Fetch danh sách (GET /staffs?role=) ──────────────────
    const fetchStaffs = useCallback(async (page, role) => {
        setLoading(true);
        try {
            const result = await getStaffsApi(page, PAGE_SIZE, role);
            if (result.success) {
                setDataSource(result.data?.content ?? []);
                setTotalElements(result.data?.totalElements ?? 0);
            } else {
                messageApi.error(result.message || "Không thể tải danh sách nhân sự.");
                setDataSource([]);
                setTotalElements(0);
            }
        } catch (err) {
            messageApi.error(
                err.response?.data?.message || "Lỗi kết nối máy chủ. Vui lòng thử lại."
            );
            setDataSource([]);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    }, [messageApi]);

    // Trigger khi đổi trang hoặc filter role (chỉ khi không ở search mode)
    useEffect(() => {
        if (!isSearchMode) {
            fetchStaffs(currentPage, filterRole);
        }
    }, [currentPage, filterRole, isSearchMode, fetchStaffs]);

    // ── Đổi filter role → thoát search mode, fetch lại ───────
    const handleRoleChange = (value) => {
        setFilterRole(value);
        setCurrentPage(1);
        setIsSearchMode(false);
        setSearchText("");
        setSearchQuery("");
    };

    // ── Tìm kiếm theo tên → GET /staffs/search?name= ─────────
    const handleSearch = async (value) => {
        const name = value?.trim();
        if (!name) {
            // Xóa trống → thoát search mode, về danh sách thường
            setIsSearchMode(false);
            setSearchQuery("");
            setCurrentPage(1);
            return;
        }
        setSearchQuery(name);
        setIsSearchMode(true);
        setLoading(true);
        try {
            const result = await searchStaffsApi(name);
            if (result.success) {
                const list = result.data ?? [];
                setDataSource(list);
                setTotalElements(list.length);
            } else {
                messageApi.error(result.message || "Tìm kiếm thất bại.");
                setDataSource([]);
                setTotalElements(0);
            }
        } catch (err) {
            messageApi.error(
                err.response?.data?.message || "Lỗi kết nối máy chủ. Vui lòng thử lại."
            );
            setDataSource([]);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    // ── Xóa search → về danh sách thường ─────────────────────
    const handleClearSearch = () => {
        setSearchText("");
        setSearchQuery("");
        setIsSearchMode(false);
        setCurrentPage(1);
    };

    // ── Toggle trạng thái: lock / unlock ─────────────────────
    const handleToggleStatus = async (record) => {
        const willLock = record.status === "ACTIVE";
        try {
            if (willLock) {
                await lockStaffApi(record.id);
            } else {
                await unlockStaffApi(record.id);
            }
            // Cập nhật lại UI sau khi API thành công
            setDataSource((prev) =>
                prev.map((s) =>
                    s.id === record.id
                        ? { ...s, status: willLock ? "INACTIVE" : "ACTIVE" }
                        : s
                )
            );
            messageApi.success(
                willLock
                    ? `Đã khóa tài khoản "${record.fullName}"!`
                    : `Đã mở khóa tài khoản "${record.fullName}"!`
            );
        } catch (err) {
            messageApi.error(
                err.response?.data?.message || "Cập nhật trạng thái thất bại. Vui lòng thử lại!"
            );
        }
    };

    // ── Mở Modal Thêm ────────────────────────────────────────
    const handleOpenAdd = () => {
        staffForm.resetFields();
        setModalMode("add");
        setEditingId(null);
        setModalOpen(true);
    };

    // ── Mở Modal Sửa ─────────────────────────────────────────
    const handleOpenEdit = (record) => {
        staffForm.resetFields();
        staffForm.setFieldsValue({
            fullName: record.fullName,
            email: record.email,
            phoneNumber: record.phoneNumber,
            role: record.roles[0] ?? "LIBRARIAN",
        });
        setModalMode("edit");
        setEditingId(record.id);
        setModalOpen(true);
    };

    // ── Đóng Modal ────────────────────────────────────────────
    const handleCloseModal = () => {
        setModalOpen(false);
        staffForm.resetFields();
        setEditingId(null);
    };

    // ── Submit form Thêm / Sửa ────────────────────────────────
    const handleFormFinish = async (values) => {
        setSubmitting(true);
        try {
            if (modalMode === "add") {
                // Đúng cấu trúc POST /staffs
                const payload = {
                    accountRequest: {
                        fullname: values.fullName?.trim(),
                        username: values.username?.trim(),
                        password: values.password,
                        roles: [values.role],
                    },
                    staffRequest: {
                        fullName: values.fullName?.trim(),
                        email: values.email?.trim(),
                        phoneNumber: values.phoneNumber?.trim(),
                    },
                };
                console.log("📦 Payload Thêm nhân sự:", payload);
                const result = await createStaffApi(payload);
                if (!result.success) throw new Error(result.message);
                messageApi.success("Thêm nhân sự thành công!");
            } else {
                // Cấu trúc PUT /staffs/{id}
                const payload = {
                    fullName: values.fullName?.trim(),
                    email: values.email?.trim(),
                    phoneNumber: values.phoneNumber?.trim(),
                    roles: [values.role],
                };
                console.log("📦 Payload Sửa nhân sự:", payload);
                const result = await updateStaffApi(editingId, payload);
                if (!result.success) throw new Error(result.message);
                messageApi.success("Cập nhật nhân sự thành công!");
            }

            handleCloseModal();
            if (currentPage === 1) fetchStaffs(1, filterRole);
            else setCurrentPage(1);
        } catch (err) {
            messageApi.error(
                err.response?.data?.message || err.message || "Có lỗi xảy ra. Vui lòng thử lại!"
            );
        } finally {
            setSubmitting(false);
        }
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
            title: "HỌ VÀ TÊN", key: "fullName",
            render: (_, r) => (
                <div className="sm-staff-info">
                    <span className="sm-staff-name">{r.fullName}</span>
                    <span className="sm-staff-id">ID: {r.id}</span>
                </div>
            ),
        },
        {
            title: "EMAIL", key: "email",
            render: (_, r) => <span className="sm-email-text">{r.email}</span>,
        },
        {
            title: "SỐ ĐIỆN THOẠI", key: "phoneNumber", width: 150,
            render: (_, r) => <span className="sm-phone-text">{r.phoneNumber}</span>,
        },
        {
            title: "QUYỀN HẠN", key: "roles", width: 150, align: "center",
            render: (_, r) => {
                const role = r.roles?.[0];
                const cfg = ROLE_CONFIG[role] ?? { label: role, color: "default" };
                return (
                    <Tag color={cfg.color} className="sm-role-tag">
                        {cfg.label}
                    </Tag>
                );
            },
        },
        {
            title: "TRẠNG THÁI", key: "status", width: 160, align: "center",
            render: (_, r) => (
                <div className="sm-status-cell">
                    <Switch
                        className="sm-status-switch"
                        checked={r.status === "ACTIVE"}
                        onChange={() => handleToggleStatus(r)}
                        size="small"
                    />
                    <span className={`sm-status-label ${r.status === "ACTIVE" ? "active" : "inactive"}`}>
                        {r.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
                    </span>
                </div>
            ),
        },
        {
            title: "HÀNH ĐỘNG", key: "actions", width: 100, align: "center",
            render: (_, record) => (
                <Tooltip title="Chỉnh sửa">
                    <button
                        className="action-btn edit"
                        onClick={() => handleOpenEdit(record)}
                    >
                        <EditOutlined />
                    </button>
                </Tooltip>
            ),
        },
    ];

    // ── Render ────────────────────────────────────────────────
    return (
        <div className="sm-page">
            {contextHolder}

            {/* Header */}
            <div className="sm-header">
                <div>
                    <h1 className="sm-title">Quản lý nhân sự</h1>
                    <p className="sm-subtitle">
                        {loading
                            ? "Đang tải dữ liệu..."
                            : <>Tổng cộng <strong>{totalElements}</strong> nhân sự trong hệ thống</>}
                    </p>
                </div>
                <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    className="sm-btn-add"
                    onClick={handleOpenAdd}
                    size="large"
                >
                    Thêm nhân sự
                </Button>
            </div>

            {/* Toolbar */}
            <div className="sm-toolbar">
                <Input.Search
                    prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                    placeholder="Tìm kiếm theo họ tên..."
                    value={searchText}
                    onChange={(e) => {
                        setSearchText(e.target.value);
                        if (!e.target.value) handleClearSearch();
                    }}
                    onSearch={handleSearch}
                    allowClear
                    size="large"
                    className="sm-search"
                    enterButton
                />
                <Select
                    value={filterRole}
                    onChange={handleRoleChange}
                    size="large"
                    className="sm-role-filter"
                >
                    <Select.Option value="ALL">Tất cả vai trò</Select.Option>
                    <Select.Option value="ADMIN">Quản trị viên</Select.Option>
                    <Select.Option value="LIBRARIAN">Thủ thư</Select.Option>
                </Select>
            </div>

            {/* Table */}
            <div className="sm-table-wrap">
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    rowKey="id"
                    className="sm-table"
                    loading={loading}
                    pagination={{
                        current: currentPage,
                        pageSize: PAGE_SIZE,
                        total: totalElements,
                        onChange: (page) => setCurrentPage(page),
                        showSizeChanger: false,
                        position: ["bottomCenter"],
                        showTotal: (total, range) =>
                            `${range[0]}–${range[1]} / ${total} nhân sự`,
                    }}
                    locale={{ emptyText: loading ? " " : "Không tìm thấy nhân sự nào." }}
                />
            </div>

            {/* ══ MODAL THÊM / SỬA NHÂN SỰ ══ */}
            <Modal
                title={modalMode === "add" ? "👤 Thêm nhân sự mới" : "✏️ Chỉnh sửa thông tin nhân sự"}
                open={modalOpen}
                onCancel={handleCloseModal}
                footer={null}
                width={580}
                destroyOnClose
                className="staff-modal"
            >
                <Form
                    form={staffForm}
                    layout="vertical"
                    onFinish={handleFormFinish}
                    requiredMark={false}
                    className="staff-form"
                >
                    {/* Phần tài khoản — CHỈ hiện khi thêm mới */}
                    {modalMode === "add" && (
                        <>
                            <Divider orientation="left">🔐 Thông tin tài khoản</Divider>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Tên đăng nhập"
                                        name="username"
                                        rules={[
                                            { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                                            { min: 4, message: "Tối thiểu 4 ký tự!" },
                                        ]}
                                    >
                                        <Input
                                            prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
                                            placeholder="VD: nguyen.van.a"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Mật khẩu"
                                        name="password"
                                        rules={[
                                            { required: true, message: "Vui lòng nhập mật khẩu!" },
                                            { min: 6, message: "Tối thiểu 6 ký tự!" },
                                        ]}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
                                            placeholder="Tối thiểu 6 ký tự"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </>
                    )}

                    {/* Phần thông tin cá nhân */}
                    <Divider orientation="left">👤 Thông tin cá nhân</Divider>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Họ và tên"
                                name="fullName"
                                rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                            >
                                <Input placeholder="VD: Nguyễn Văn A" size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Số điện thoại"
                                name="phoneNumber"
                                rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
                            >
                                <Input placeholder="VD: 0901234567" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: "Vui lòng nhập email!" },
                                    { type: "email", message: "Email không hợp lệ!" },
                                ]}
                            >
                                <Input placeholder="VD: an@email.com" size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Quyền hạn"
                                name="role"
                                initialValue="LIBRARIAN"
                                rules={[{ required: true, message: "Vui lòng chọn quyền hạn!" }]}
                            >
                                <Select size="large" placeholder="Chọn vai trò">
                                    <Select.Option value="ADMIN">
                                        <Tag color="gold" style={{ marginRight: 6 }}>ADMIN</Tag>
                                        Quản trị viên
                                    </Select.Option>
                                    <Select.Option value="LIBRARIAN">
                                        <Tag color="blue" style={{ marginRight: 6 }}>LIBRARIAN</Tag>
                                        Thủ thư
                                    </Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

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
                            className="sm-btn-add"
                        >
                            {modalMode === "add" ? "Tạo tài khoản" : "Lưu thay đổi"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default StaffManagement;