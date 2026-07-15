// ============================================================
// src/pages/SystemSettings/SystemSettings.jsx
// Trang Cài đặt hệ thống — API thật, Card-based Grid Layout.
//
// Card 1: Quy định Mượn - Trả
//   MAX_BORROW_BOOKS, MAX_BORROW_DAYS,
//   MAX_RENEW_TIMES, MAX_RENEW_DURATION_MONTHS
//
// Card 2: Cấu hình Phạt vạ
//   FINE_PER_DAY, FINE_BY_LOST, FINE_BY_DAMAGE
//
// Phân quyền: chỉ role ADMIN mới được chỉnh sửa và lưu.
// ============================================================

import React, { useState, useEffect } from "react";
import {
    Form, InputNumber, Button, Row, Col,
    Card, Spin, Tooltip, Divider, Tag, message,
} from "antd";
import {
    SaveOutlined, BookOutlined, DollarOutlined,
    QuestionCircleOutlined, InfoCircleOutlined,
    SettingOutlined, LockOutlined,
} from "@ant-design/icons";
import { getSettingsApi, updateSettingsApi } from "../../services/settingsService";
import "./SystemSettings.css";

// ── Helper: đọc user từ localStorage ─────────────────────────
const getUserFromStorage = () => {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

// ── Helper: kiểm tra có role ADMIN không ─────────────────────
const isAdmin = (user) =>
    Array.isArray(user?.roles) &&
    user.roles.some((r) => r.name === "ADMIN");

// ── Helper: convert mảng content → object cho Form ───────────
// [{ settingKey: "MAX_BORROW_DAYS", settingValue: "14" }]
// → { MAX_BORROW_DAYS: 14 }
const settingsArrayToObject = (arr) =>
    arr.reduce((acc, item) => {
        acc[item.settingKey] = Number(item.settingValue);
        return acc;
    }, {});

// ── Helper: convert mảng content → map description ───────────
// → { MAX_BORROW_DAYS: "Số ngày tối đa...", ... }
const settingsArrayToDescMap = (arr) =>
    arr.reduce((acc, item) => {
        acc[item.settingKey] = item.description ?? "";
        return acc;
    }, {});

// ── Helper: convert object Form → mảng phẳng cho Backend ─────
// { MAX_BORROW_DAYS: 14 }
// → [{ settingKey: "MAX_BORROW_DAYS", settingValue: "14" }]
const objectToSettingsArray = (obj) =>
    Object.entries(obj).map(([settingKey, settingValue]) => ({
        settingKey,
        settingValue: String(settingValue ?? ""),
    }));

// ── Formatter / Parser cho ô tiền tệ ─────────────────────────
const currencyFormatter = (value) => {
    if (value === undefined || value === null || value === "") return "";
    return `${Number(value).toLocaleString("vi-VN")} VNĐ`;
};

const currencyParser = (value) => {
    if (!value) return 0;
    const cleaned = value.replace(/[^\d]/g, "");
    return cleaned === "" ? 0 : Number(cleaned);
};

// ── Label kèm Tooltip description ────────────────────────────
const FieldLabel = ({ text, description }) => (
    <span className="ss-field-label">
        <span className="ss-field-label-text">{text}</span>
        {description && (
            <Tooltip title={description} placement="right">
                <QuestionCircleOutlined className="ss-tooltip-icon" />
            </Tooltip>
        )}
    </span>
);

// ── Component chính ───────────────────────────────────────────
const SystemSettings = () => {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const [pageLoading, setPageLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [descriptions, setDescriptions] = useState({}); // { settingKey: description }

    // Kiểm tra quyền ADMIN từ localStorage
    const user = getUserFromStorage();
    const canEdit = isAdmin(user);

    // ── Mount: gọi GET /settings → đổ vào Form ───────────────
    useEffect(() => {
        const fetchSettings = async () => {
            setPageLoading(true);
            try {
                const result = await getSettingsApi();
                if (!result.success) throw new Error(result.message);

                const content = result.data?.content ?? [];

                // Lưu descriptions vào state riêng
                setDescriptions(settingsArrayToDescMap(content));

                // Đổ values vào Form
                form.setFieldsValue(settingsArrayToObject(content));
            } catch (err) {
                messageApi.error(
                    err.response?.data?.message ||
                    "Không thể tải cấu hình hệ thống. Vui lòng thử lại!"
                );
            } finally {
                setPageLoading(false);
            }
        };

        fetchSettings();
    }, [form, messageApi]);

    // ── Submit: PUT /settings ─────────────────────────────────
    const handleFinish = async (values) => {
        if (!canEdit) return;

        setIsSaving(true);
        try {
            const payload = objectToSettingsArray(values);
            console.log("📦 Payload gửi Backend:", payload);

            const result = await updateSettingsApi(payload);
            if (!result.success) throw new Error(result.message);

            messageApi.success("Cập nhật cấu hình hệ thống thành công!");
        } catch (err) {
            messageApi.error(
                err.response?.data?.message ||
                err.message ||
                "Lưu cấu hình thất bại. Vui lòng thử lại!"
            );
        } finally {
            setIsSaving(false);
        }
    };

    // ── Render mỗi Form.Item ──────────────────────────────────
    const renderField = ({ name, label, addonAfter, isCurrency, min = 0, max, step }) => (
        <React.Fragment key={name}>
            <Form.Item
                label={
                    <FieldLabel
                        text={label}
                        description={descriptions[name]}
                    />
                }
                name={name}
                rules={[
                    { required: true, message: "Vui lòng nhập giá trị!" },
                    ...(max
                        ? [{ type: "number", min, max, message: `Giá trị từ ${min} đến ${max}!` }]
                        : [{ type: "number", min, message: `Giá trị không được nhỏ hơn ${min}!` }]
                    ),
                ]}
            >
                {isCurrency ? (
                    <InputNumber
                        className="ss-input-number"
                        min={min}
                        step={step ?? 1000}
                        size="large"
                        formatter={currencyFormatter}
                        parser={currencyParser}
                        disabled={!canEdit}
                    />
                ) : (
                    <InputNumber
                        className="ss-input-number"
                        min={min}
                        max={max}
                        step={step ?? 1}
                        size="large"
                        addonAfter={addonAfter}
                        disabled={!canEdit}
                    />
                )}
            </Form.Item>
            {descriptions[name] && (
                <p className="ss-field-hint">{descriptions[name]}</p>
            )}
        </React.Fragment>
    );

    // ── Định nghĩa các field theo từng Card ──────────────────
    const CARD1_FIELDS = [
        { name: "MAX_BORROW_BOOKS", label: "Số sách tối đa / lượt mượn", addonAfter: "cuốn", min: 1, max: 20 },
        { name: "MAX_BORROW_DAYS", label: "Số ngày mượn tối đa", addonAfter: "ngày", min: 1, max: 365 },
        { name: "MAX_RENEW_TIMES", label: "Số lần gia hạn tối đa", addonAfter: "lần", min: 0, max: 10 },
        { name: "MAX_RENEW_DURATION_MONTHS", label: "Số tháng gia hạn tối đa", addonAfter: "tháng", min: 1, max: 12 },
    ];

    const CARD2_FIELDS = [
        { name: "FINE_PER_DAY", label: "Tiền phạt mỗi ngày quá hạn", isCurrency: true, min: 0, step: 1000 },
        { name: "FINE_BY_LOST", label: "Tiền phạt khi làm mất sách", isCurrency: true, min: 0, step: 10000 },
        { name: "FINE_BY_DAMAGE", label: "Tiền phạt khi làm hỏng sách", isCurrency: true, min: 0, step: 10000 },
    ];

    // ── Render ────────────────────────────────────────────────
    return (
        <div className="ss-page">
            {contextHolder}

            {/* Header — bỏ nút góc phải theo yêu cầu */}
            <div className="ss-header">
                <div className="ss-header-left">
                    <p className="ss-eyebrow">
                        <SettingOutlined style={{ marginRight: 5 }} />
                        Quản trị hệ thống
                    </p>
                    <h1 className="ss-title">Cấu hình hệ thống</h1>
                    <p className="ss-subtitle">
                        Điều chỉnh các tham số vận hành của thư viện
                    </p>
                </div>
                {/* Hiển thị badge role để thủ thư biết mình không có quyền */}
                {!canEdit && (
                    <Tooltip title="Chỉ Admin mới được thay đổi cấu hình hệ thống">
                        <Tag
                            icon={<LockOutlined />}
                            color="default"
                            style={{ fontSize: 13, padding: "6px 12px", borderRadius: 8, alignSelf: "center" }}
                        >
                            Chỉ đọc
                        </Tag>
                    </Tooltip>
                )}
            </div>

            {/* Loading lần đầu */}
            {pageLoading ? (
                <div className="ss-spin-wrap">
                    <Spin size="large" tip="Đang tải cấu hình..." />
                </div>
            ) : (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    requiredMark={false}
                    className="ss-form"
                >
                    <Row gutter={[24, 24]}>
                        {/* ── Card 1: Quy định Mượn - Trả ── */}
                        <Col xs={24} lg={12}>
                            <Card
                                className="ss-section-card"
                                title={
                                    <div className="ss-card-header">
                                        <div className="ss-card-icon blue">
                                            <BookOutlined />
                                        </div>
                                        <div>
                                            <div className="ss-card-title">Quy định Mượn - Trả</div>
                                            <div className="ss-card-desc">
                                                Giới hạn số sách, thời gian và gia hạn
                                            </div>
                                        </div>
                                    </div>
                                }
                            >
                                {CARD1_FIELDS.map((field, idx) => (
                                    <React.Fragment key={field.name}>
                                        {renderField(field)}
                                        {idx < CARD1_FIELDS.length - 1 && (
                                            <Divider className="ss-form-divider" />
                                        )}
                                    </React.Fragment>
                                ))}
                            </Card>
                        </Col>

                        {/* ── Card 2: Cấu hình Phạt vạ ── */}
                        <Col xs={24} lg={12}>
                            <Card
                                className="ss-section-card"
                                title={
                                    <div className="ss-card-header">
                                        <div className="ss-card-icon orange">
                                            <DollarOutlined />
                                        </div>
                                        <div>
                                            <div className="ss-card-title">Cấu hình Phạt vạ</div>
                                            <div className="ss-card-desc">
                                                Mức phạt quá hạn, mất sách và hỏng sách
                                            </div>
                                        </div>
                                    </div>
                                }
                            >
                                {CARD2_FIELDS.map((field, idx) => (
                                    <React.Fragment key={field.name}>
                                        {renderField(field)}
                                        {idx < CARD2_FIELDS.length - 1 && (
                                            <Divider className="ss-form-divider" />
                                        )}
                                    </React.Fragment>
                                ))}
                            </Card>
                        </Col>
                    </Row>

                    {/* Footer sticky — nút Lưu chỉ sáng khi là ADMIN */}
                    <div className="ss-footer-bar">
                        <span className="ss-footer-hint">
                            <InfoCircleOutlined />
                            {canEdit
                                ? "Thay đổi sẽ được áp dụng ngay sau khi lưu thành công"
                                : "Bạn đang ở chế độ chỉ đọc — liên hệ Admin để thay đổi cấu hình"}
                        </span>
                        <Tooltip
                            title={!canEdit ? "Chỉ Admin mới được lưu thay đổi" : ""}
                            placement="left"
                        >
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                htmlType="submit"
                                size="large"
                                className="ss-save-btn"
                                loading={isSaving}
                                disabled={!canEdit}
                            >
                                Lưu tất cả thay đổi
                            </Button>
                        </Tooltip>
                    </div>
                </Form>
            )}
        </div>
    );
};

export default SystemSettings;