// ============================================================
// src/pages/ReaderManagement/Index.jsx
// Trang Quản lý Độc giả — API thật, phân trang server-side.
//
// Response danh sách (phẳng):
//   { id, fullName, email, phoneNumber, cardCode, cardStatus, expiryDate }
//
// Response chi tiết (GET /readers/{id}):
//   { fullName, email, phoneNumber, address, gender, dateOfBirth,
//     libraryCardResponse: { issueDate, expiryDate, status, ... } }
//
// cardStatus: ACTIVE | LOCKED | EXPIRED
// Pagination: BE 0-indexed → trừ 1 khi gửi lên, cộng 1 khi hiển thị
// ============================================================

import React, { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import {
    Table, Input, Button, Select, Tag, Space,
    Tooltip, Modal, Form, DatePicker, Divider,
    Row, Col, Popconfirm, Spin, Alert, message,
} from "antd";
import {
    PlusOutlined, SearchOutlined,
    EyeOutlined, EditOutlined,
    LockOutlined, UnlockOutlined,
} from "@ant-design/icons";
import {
    getReadersApi,
    getReaderByIdApi,
    createReaderApi,
    updateReaderApi,
    lockReaderApi,
    unlockReaderApi,
} from "../../services/readerService";
import "./ReaderManagement.css";

// ── Hằng số ──────────────────────────────────────────────────
const PAGE_SIZE = 10;

// cardStatus trả về từ BE → Tag hiển thị
const STATUS_MAP = {
    ACTIVE: { label: "ĐANG HOẠT ĐỘNG", color: "success" },
    LOCKED: { label: "ĐÃ KHÓA", color: "error" },
    EXPIRED: { label: "QUÁ HẠN", color: "warning" },
};

// ── Helper ────────────────────────────────────────────────────
const fmt = (d) => d ? dayjs(d).format("DD/MM/YYYY") : "—";

// ── Component chính ───────────────────────────────────────────
const ReaderManagement = () => {
    const [messageApi, contextHolder] = message.useMessage();

    // ── Data states ───────────────────────────────────────────
    const [readers, setReaders] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ── Filter / Search ───────────────────────────────────────
    const [searchText, setSearchText] = useState("");    // controlled input
    const [searchQuery, setSearchQuery] = useState("");  // đã xác nhận → trigger API
    const [filterStatus, setFilterStatus] = useState("ALL");

    // ── Pagination ────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);  // AntD 1-indexed

    // ── Modal states ──────────────────────────────────────────
    const [modalMode, setModalMode] = useState("add");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false); // loading khi fetch chi tiết
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [readerForm] = Form.useForm();

    // ── Fetch danh sách độc giả từ API ────────────────────────
    const fetchReaders = useCallback(async (page, status, name) => {
        setLoading(true);
        setError(null);
        try {
            const result = await getReadersApi(page, PAGE_SIZE, status, name);
            if (result.success) {
                setReaders(result.data?.content ?? []);
                setTotalElements(result.data?.totalElements ?? 0);
            } else {
                setError(result.message || "Không thể tải danh sách độc giả.");
                setReaders([]);
                setTotalElements(0);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi kết nối máy chủ. Vui lòng thử lại.");
            setReaders([]);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    }, []);

    // Trigger khi đổi trang, bộ lọc trạng thái, hoặc từ khóa tìm kiếm
    useEffect(() => {
        fetchReaders(currentPage, filterStatus, searchQuery);
    }, [currentPage, filterStatus, searchQuery, fetchReaders]);

    // ── Đổi bộ lọc trạng thái → reset về trang 1 ─────────────
    const handleStatusChange = (value) => {
        setFilterStatus(value);
        setCurrentPage(1);
    };

    // ── Chuyển trang ──────────────────────────────────────────
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // readers đã được lọc từ BE, dùng thẳng làm dataSource
    const displayReaders = readers;

    // ── Modal handlers ────────────────────────────────────────
    const handleOpenAdd = () => {
        readerForm.resetFields();
        setModalMode("add");
        setEditingId(null);
        setModalOpen(true);
    };

    /**
     * Mở modal Edit: mở ngay (UX không giật), sau đó fetch chi tiết
     * từ GET /readers/{id} để lấy đầy đủ gender, dateOfBirth, issueDate...
     */
    const handleOpenEdit = async (record) => {
        readerForm.resetFields();
        setModalMode("edit");
        setEditingId(record.id);
        setModalOpen(true);
        setModalLoading(true);

        try {
            const result = await getReaderByIdApi(record.id);
            if (!result.success) throw new Error(result.message);

            const d = result.data;
            const card = d.libraryCardResponse;

            readerForm.setFieldsValue({
                readerRequest: {
                    fullName: d.fullName,
                    email: d.email,
                    phoneNumber: d.phoneNumber,
                    address: d.address ?? "",
                    gender: d.gender ?? undefined,
                    dateOfBirth: d.dateOfBirth ? dayjs(d.dateOfBirth) : null,
                },
                libraryCardRequest: {
                    issueDate: card?.issueDate ? dayjs(card.issueDate) : null,
                    expiryDate: card?.expiryDate ? dayjs(card.expiryDate) : null,
                    status: card?.status ?? "ACTIVE",
                },
            });
        } catch (err) {
            messageApi.error(
                err.response?.data?.message || "Không thể tải thông tin độc giả. Vui lòng thử lại!"
            );
            handleCloseModal();
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setModalLoading(false);
        readerForm.resetFields();
        setEditingId(null);
    };

    // ── Submit form ───────────────────────────────────────────
    const handleFormFinish = async (values) => {
        setSubmitting(true);
        try {
            const rawIssue = values.libraryCardRequest?.issueDate;
            const rawExpiry = values.libraryCardRequest?.expiryDate;
            const rawDOB = values.readerRequest?.dateOfBirth;

            const issueDJ = rawIssue ? dayjs(rawIssue) : dayjs();
            const expiryDJ = rawExpiry ? dayjs(rawExpiry) : issueDJ.add(4, "year");
            const dobStr = rawDOB ? dayjs(rawDOB).format("YYYY-MM-DD") : null;

            if (modalMode === "add") {
                const payload = {
                    accountRequest: {
                        username: values.accountRequest?.username,
                        password: values.accountRequest?.password,
                        roles: ["READER"],
                    },
                    libraryCardRequest: {
                        issueDate: issueDJ.format("YYYY-MM-DDTHH:mm:ss"),
                        expiryDate: expiryDJ.format("YYYY-MM-DDTHH:mm:ss"),
                        status: values.libraryCardRequest?.status ?? "ACTIVE",
                    },
                    readerRequest: { ...values.readerRequest, dateOfBirth: dobStr },
                };
                const result = await createReaderApi(payload);
                if (!result.success) throw new Error(result.message);
                messageApi.success("Thêm độc giả thành công!");
                handleCloseModal();
                if (currentPage === 1) fetchReaders(1, filterStatus, searchQuery);
                else setCurrentPage(1);

            } else {
                const payload = {
                    libraryCardRequest: {
                        expiryDate: expiryDJ.format("YYYY-MM-DDTHH:mm:ss"),
                        status: values.libraryCardRequest?.status ?? "ACTIVE",
                    },
                    readerRequest: { ...values.readerRequest, dateOfBirth: dobStr },
                };
                const result = await updateReaderApi(editingId, payload);
                if (!result.success) throw new Error(result.message);
                messageApi.success("Cập nhật thành công!");
                handleCloseModal();
                fetchReaders(currentPage, filterStatus, searchQuery);
            }
        } catch (err) {
            console.error(err);
            messageApi.error(
                err.response?.data?.message || err.message || "Có lỗi xảy ra. Vui lòng thử lại!"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleView = (r) => messageApi.info(`Xem chi tiết: ${r.fullName}`);

    const handleToggleLock = async (record) => {
        const locked = record.cardStatus === "LOCKED";
        try {
            if (locked) {
                await unlockReaderApi(record.id);
                messageApi.success(`Đã mở khóa "${record.fullName}"!`);
            } else {
                await lockReaderApi(record.id);
                messageApi.success(`Đã khóa "${record.fullName}"!`);
            }
            fetchReaders(currentPage, filterStatus, searchQuery);
        } catch (err) {
            messageApi.error(
                err.response?.data?.message || "Thao tác thất bại. Vui lòng thử lại."
            );
        }
    };

    // ── Cột bảng ──────────────────────────────────────────────
    const columns = [
        {
            title: "STT", key: "stt", width: 58, align: "center",
            render: (_, __, i) => (
                <span className="cell-stt">{(currentPage - 1) * PAGE_SIZE + i + 1}</span>
            ),
        },
        {
            title: "ĐỘC GIẢ", key: "reader",
            render: (_, r) => (
                <div className="reader-info-cell">
                    <span className="reader-name">{r.fullName}</span>
                    <span className="reader-email">{r.email}</span>
                </div>
            ),
        },
        {
            title: "MÃ THẺ", key: "cardCode", width: 160,
            render: (_, r) => <span className="card-code-text">{r.cardCode ?? "—"}</span>,
        },
        {
            title: "HẠN SỬ DỤNG", key: "expiry", width: 150, align: "center",
            render: (_, r) => {
                const expired =
                    r.cardStatus === "EXPIRED" ||
                    (r.expiryDate && dayjs(r.expiryDate).isBefore(dayjs(), "day"));
                return (
                    <span className={`expiry-date ${expired ? "expired" : ""}`}>
                        {fmt(r.expiryDate)}
                        {expired && <span className="expired-label"> (HH)</span>}
                    </span>
                );
            },
        },
        {
            title: "TRẠNG THÁI", key: "status", width: 165, align: "center",
            render: (_, r) => {
                const cfg = STATUS_MAP[r.cardStatus] ?? { label: r.cardStatus ?? "—", color: "default" };
                return <Tag color={cfg.color} className="reader-status-tag">{cfg.label}</Tag>;
            },
        },
        {
            title: "THAO TÁC", key: "actions", width: 130, align: "center",
            render: (_, record) => {
                const locked = record.cardStatus === "LOCKED";
                return (
                    <Space size={4}>
                        <Tooltip title="Xem chi tiết">
                            <button className="action-btn view" onClick={() => handleView(record)}>
                                <EyeOutlined />
                            </button>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa">
                            <button className="action-btn edit" onClick={() => handleOpenEdit(record)}>
                                <EditOutlined />
                            </button>
                        </Tooltip>
                        <Tooltip title={locked ? "Mở khóa" : "Khóa tài khoản"}>
                            <Popconfirm
                                title={locked ? "Xác nhận mở khóa" : "Xác nhận khóa tài khoản"}
                                description={`${locked ? "Mở khóa" : "Khóa"} "${record.fullName}"?`}
                                onConfirm={() => handleToggleLock(record)}
                                okText="Xác nhận" cancelText="Hủy"
                                okButtonProps={{ danger: !locked }}
                            >
                                <button className={`action-btn ${locked ? "unlock" : "lock"}`}>
                                    {locked ? <UnlockOutlined /> : <LockOutlined />}
                                </button>
                            </Popconfirm>
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    // ── Render ────────────────────────────────────────────────
    return (
        <div className="rm-page">
            {contextHolder}

            {/* Header */}
            <div className="rm-header">
                <div>
                    <h1 className="rm-title">Quản lý độc giả</h1>
                    <p className="rm-subtitle">
                        {loading
                            ? "Đang tải dữ liệu..."
                            : <>Tổng cộng <strong>{totalElements.toLocaleString("vi-VN")}</strong> độc giả</>}
                    </p>
                </div>
                <Button type="primary" icon={<PlusOutlined />}
                    className="rm-btn-add" onClick={handleOpenAdd} size="large">
                    Thêm độc giả
                </Button>
            </div>

            {/* Toolbar */}
            <div className="rm-toolbar">
                <Input
                    prefix={<SearchOutlined className="search-icon" />}
                    placeholder="Tìm kiếm họ tên... (Enter để tìm)"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={() => {
                        setSearchQuery(searchText.trim());
                        setCurrentPage(1);
                    }}
                    onClear={() => {
                        setSearchText("");
                        setSearchQuery("");
                        setCurrentPage(1);
                    }}
                    allowClear size="large" className="rm-search"
                />
                <Select value={filterStatus} onChange={handleStatusChange}
                    size="large" className="rm-status-filter">
                    <Select.Option value="ALL">Tất cả trạng thái</Select.Option>
                    <Select.Option value="ACTIVE">Đang hoạt động</Select.Option>
                    <Select.Option value="LOCKED">Đã khóa</Select.Option>
                    <Select.Option value="EXPIRED">Quá hạn</Select.Option>
                </Select>
            </div>

            {/* Lỗi */}
            {error && (
                <Alert
                    message="Không thể tải dữ liệu" description={error}
                    type="error" showIcon closable onClose={() => setError(null)}
                    style={{ marginBottom: 16 }}
                    action={
                        <Button size="small" onClick={() => fetchReaders(currentPage, filterStatus, searchQuery)}>
                            Thử lại
                        </Button>
                    }
                />
            )}

            {/* Table */}
            <div className="rm-table-wrap">
                <Spin spinning={loading} size="large">
                    <Table
                        columns={columns}
                        dataSource={displayReaders}
                        rowKey="id"
                        className="rm-table"
                        loading={false}
                        pagination={{
                            current: currentPage,
                            pageSize: PAGE_SIZE,
                            total: totalElements,
                            onChange: handlePageChange,
                            showSizeChanger: false,
                            position: ["bottomCenter"],
                            showTotal: (total, range) =>
                                `${range[0]}–${range[1]} / ${total} độc giả`,
                        }}
                        locale={{ emptyText: loading ? " " : "Không tìm thấy độc giả nào." }}
                    />
                </Spin>
            </div>

            {/* ══ MODAL FORM ══ */}
            <Modal
                title={modalMode === "add" ? "➕ Thêm độc giả mới" : "📝 Hiệu chỉnh thông tin độc giả"}
                open={modalOpen}
                onCancel={handleCloseModal}
                footer={null}
                width={800}
                destroyOnClose
                className="reader-modal"
            >
                {/* Spin bao toàn bộ form khi đang fetch chi tiết */}
                <Spin spinning={modalLoading} tip="Đang tải thông tin...">
                    <Form
                        form={readerForm}
                        layout="vertical"
                        onFinish={handleFormFinish}
                        requiredMark={false}
                        className="reader-form"
                    >
                        {/* PHẦN 1: Tài khoản — CHỈ hiện khi thêm mới */}
                        {modalMode === "add" && (
                            <>
                                <Divider orientation="left" className="form-divider">
                                    🔐 Thông tin tài khoản hệ thống
                                </Divider>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Tên đăng nhập"
                                            name={["accountRequest", "username"]}
                                            rules={[{ required: true, message: "Vui lòng nhập username!" }]}
                                        >
                                            <Input placeholder="VD: nguyen.van.an" size="large" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Mật khẩu"
                                            name={["accountRequest", "password"]}
                                            rules={[
                                                { required: true, message: "Vui lòng nhập mật khẩu!" },
                                                { min: 6, message: "Tối thiểu 6 ký tự!" },
                                            ]}
                                        >
                                            <Input.Password placeholder="Tối thiểu 6 ký tự" size="large" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </>
                        )}

                        {/* PHẦN 2: Thẻ thư viện */}
                        <Divider orientation="left" className="form-divider">🪪 Thẻ thư viện</Divider>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    label="Ngày cấp thẻ"
                                    name={["libraryCardRequest", "issueDate"]}
                                    tooltip={modalMode === "edit" ? "Không thể thay đổi ngày cấp" : "Để trống = hôm nay"}
                                >
                                    <DatePicker
                                        format="DD/MM/YYYY"
                                        placeholder={modalMode === "add" ? "Mặc định: hôm nay" : ""}
                                        size="large"
                                        style={{ width: "100%" }}
                                        disabled={modalMode === "edit"}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={modalMode === "edit" ? "Ngày hết hạn (Gia hạn)" : "Ngày hết hạn"}
                                    name={["libraryCardRequest", "expiryDate"]}
                                    tooltip={modalMode === "add" ? "Để trống = ngày cấp + 4 năm" : undefined}
                                >
                                    <DatePicker
                                        format="DD/MM/YYYY"
                                        placeholder={modalMode === "add" ? "Mặc định: +4 năm" : "Chọn ngày gia hạn"}
                                        size="large"
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Trạng thái thẻ"
                                    name={["libraryCardRequest", "status"]}
                                    initialValue="ACTIVE"
                                    rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
                                >
                                    <Select size="large">
                                        <Select.Option value="ACTIVE">Đang hoạt động</Select.Option>
                                        <Select.Option value="LOCKED">Đã khóa</Select.Option>
                                        <Select.Option value="EXPIRED">Quá hạn</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* PHẦN 3: Thông tin cá nhân */}
                        <Divider orientation="left" className="form-divider">👤 Thông tin cá nhân độc giả</Divider>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Họ và tên"
                                    name={["readerRequest", "fullName"]}
                                    rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                                >
                                    <Input placeholder="VD: Nguyễn Văn An" size="large" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Email"
                                    name={["readerRequest", "email"]}
                                    rules={[
                                        { required: true, message: "Vui lòng nhập email!" },
                                        { type: "email", message: "Email không hợp lệ!" },
                                    ]}
                                >
                                    <Input placeholder="VD: an@email.com" size="large" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    label="Số điện thoại"
                                    name={["readerRequest", "phoneNumber"]}
                                    rules={[{ required: true, message: "Vui lòng nhập SĐT!" }]}
                                >
                                    <Input placeholder="VD: 0901234567" size="large" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Giới tính"
                                    name={["readerRequest", "gender"]}
                                    rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
                                >
                                    <Select placeholder="Chọn giới tính" size="large">
                                        <Select.Option value="MALE">Nam</Select.Option>
                                        <Select.Option value="FEMALE">Nữ</Select.Option>
                                        <Select.Option value="OTHER">Khác</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Ngày sinh"
                                    name={["readerRequest", "dateOfBirth"]}
                                >
                                    <DatePicker
                                        format="DD/MM/YYYY"
                                        placeholder="Chọn ngày sinh"
                                        size="large"
                                        style={{ width: "100%" }}
                                        disabledDate={(d) => d && d.isAfter(dayjs())}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    label="Địa chỉ"
                                    name={["readerRequest", "address"]}
                                >
                                    <Input placeholder="VD: 123 Lê Lợi, Q.1, TP.HCM" size="large" />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Footer */}
                        <div className="form-footer">
                            <Button size="large" onClick={handleCloseModal}>Hủy</Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={submitting}
                                disabled={modalLoading}
                                size="large"
                                className="rm-btn-add"
                            >
                                {modalMode === "add" ? "Tạo tài khoản" : "Lưu thay đổi"}
                            </Button>
                        </div>
                    </Form>
                </Spin>
            </Modal>
        </div>
    );
};

export default ReaderManagement;