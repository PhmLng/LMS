// ============================================================
// src/pages/Login/index.jsx
// Cập nhật: dùng loginApi từ authService (đã tự lưu localStorage).
// Sau khi thành công, gọi onLoginSuccess() để App.jsx điều hướng.
// ============================================================

import React, { useState } from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { loginApi } from "../../services/authService";
import "./Login.css";

/**
 * @param {function} onLoginSuccess - Callback App.jsx truyền vào.
 *   Được gọi sau khi đăng nhập & lưu localStorage thành công.
 */
const LoginPage = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      // loginApi đã tự lưu accessToken, refreshToken, user vào localStorage
      const result = await loginApi(values.username, values.password);

      if (result.success) {
        messageApi.success(result.message || "Đăng nhập thành công!");
        // Báo App.jsx cập nhật state và điều hướng về "/"
        if (onLoginSuccess) onLoginSuccess();
      } else {
        messageApi.error(result.message || "Thông tin đăng nhập không hợp lệ.");
      }
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        "Không thể kết nối đến máy chủ. Vui lòng thử lại.";
      messageApi.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-layout">
      {contextHolder}

      {/* HEADER */}
      <header className="login-header">
        <div className="header-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span>HỆ THỐNG QUẢN LÝ THƯ VIỆN</span>
        </div>
        <button className="header-help">?</button>
      </header>

      {/* MAIN */}
      <main className="login-main">
        <div className="login-card">
          <div className="card-header">
            <h1 className="card-title">Đăng Nhập</h1>
            <p className="card-subtitle">Truy cập hệ thống bằng tài khoản của bạn</p>
          </div>

          <Form name="login_form" layout="vertical" onFinish={handleFinish} autoComplete="off" requiredMark={false}>
            <Form.Item
              label="USERNAME"
              name="username"
              className="form-item-custom"
              rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
            >
              <Input placeholder="admin123" className="input-custom" size="large" />
            </Form.Item>

            <Form.Item
              className="form-item-custom"
              label={
                <div className="passcode-label-row">
                  <span>PASSCODE</span>
                  <button type="button" className="reset-link">RESET</button>
                </div>
              }
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password placeholder="••••••••" className="input-custom" size="large" visibilityToggle={false} />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked" className="form-item-checkbox">
              <Checkbox className="checkbox-custom">Keep this session active</Checkbox>
            </Form.Item>

            <Form.Item className="form-item-button">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="btn-submit"
                block
                size="large"
                icon={!loading && <ArrowRightOutlined />}
                iconPosition="end"
              >
                Truy cập
              </Button>
            </Form.Item>
          </Form>

          <div className="card-footer">
            <div className="card-footer-line" />
            <span className="card-footer-text">SYSTEM NODE 04-B</span>
            <div className="card-footer-line" />
          </div>
        </div>
      </main>

      <footer className="login-page-footer">
        <span>© 2026 HỆ THỐNG QUẢN LÝ THƯ VIỆN</span>
        <div className="footer-links">
          <a href="#">TERMS</a>
          <a href="#">PRIVACY</a>
          <a href="#">SUPPORT</a>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;