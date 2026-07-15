// ============================================================
// src/App.jsx
// Root Component — Layout Routes pattern, 3 nhóm tuyến đường:
//   PublicLayout   → Header + Outlet   (trang công cộng)
//   Standalone     → không layout      (/login)
//   ProtectedRoute → AdminLayout       (/admin/*)
// ============================================================

import React, { useState, useCallback } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";

import AppHeader from "./components/Header/index";
import AdminLayout from "./components/AdminLayout/Index";
import ProtectedRoute from "./components/ProtectedRoute/index";
import LoginPage from "./pages/Login/index";
import HomePage from "./pages/Home/index";
import Dashboard from "./pages/Dashboard/Index";
import BookManagement from "./pages/BookManagement/Index";
import BookDetail from "./pages/BookDetailManagement/Index";
import AuthorManagement from "./pages/AuthorManagement/Index";
import PublisherManagement from "./pages/PublisherManagement/Index";
import CategoryManagement from "./pages/CategoryManagement/Index";
import ReaderManagement from "./pages/ReaderManagement/Index";
import BorrowManagement from "./pages/BorrowManagement/Index";
import ReturnBook from "./pages/BorrowManagement/ReturnBook";
import FineManagement from "./pages/FineManagement/Index";
import SystemSettings from "./pages/SystemSettings/Index";
import StaffManagement from "./pages/StaffManagement/Index";
// ── Thêm các trang Admin khác vào đây khi xây dựng ──────────
// import ManageMembers from "./pages/Admin/Members/Index";

// ── Helper ──────────────────────────────────────────────────
const getUserFromStorage = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ── PublicLayout: Header + Outlet ────────────────────────────
const PublicLayout = ({ user, onLogout }) => (
  <>
    <AppHeader user={user} onLogout={onLogout} />
    <Outlet />
  </>
);

// ── AppRoutes ─────────────────────────────────────────────────
const AppRoutes = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUserFromStorage);

  const handleLoginSuccess = useCallback(() => {
    setUser(getUserFromStorage());
    navigate("/");
  }, [navigate]);

  const handleLogout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <Routes>

      {/* ══════════════════════════════════════════════════════
          NHÓM 1 — PUBLIC LAYOUT (có Header)
          ══════════════════════════════════════════════════════ */}
      <Route element={<PublicLayout user={user} onLogout={handleLogout} />}>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/about"  element={<AboutPage />} /> */}
      </Route>

      {/* ══════════════════════════════════════════════════════
          NHÓM 2 — STANDALONE (không layout)
          ══════════════════════════════════════════════════════ */}
      <Route
        path="/login"
        element={
          user
            ? <Navigate to="/" replace />
            : <LoginPage onLoginSuccess={handleLoginSuccess} />
        }
      />

      {/* ══════════════════════════════════════════════════════
          NHÓM 3 — PROTECTED ADMIN
          Lớp 1: ProtectedRoute (kiểm tra role ADMIN / THU_THU)
          Lớp 2: AdminLayout (Sidebar Ant Design + Outlet)
          Lớp 3: Trang con cụ thể
          ══════════════════════════════════════════════════════ */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout onLogout={handleLogout} />}>

          {/* Trang mặc định /admin → /admin/dashboard */}
          <Route index path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/books" element={<BookManagement />} />
          <Route path="/admin/books/:id" element={<BookDetail />} />
          <Route path="/admin/authors" element={<AuthorManagement />} />
          <Route path="/admin/publishers" element={<PublisherManagement />} />
          <Route path="/admin/categories" element={<CategoryManagement />} />
          <Route path="/admin/members" element={<ReaderManagement />} />
          <Route path="/admin/borrows" element={<BorrowManagement />} />
          <Route path="/admin/returns" element={<ReturnBook />} />
          <Route path="/admin/fines" element={<FineManagement />} />
          <Route path="/admin/settings" element={<SystemSettings />} />
          <Route path="/admin/staff" element={<StaffManagement />} />
          {/* Thêm trang admin mới tại đây:
<Route path="/admin/returns" element={<ReturnManagement />} />
              <Route path="/admin/members"   element={<ManageMembers />} />
              <Route path="/admin/borrows"   element={<ManageBorrows />} />
              <Route path="/admin/fines"     element={<ManageFines />} />
              <Route path="/admin/reports"   element={<Reports />} />
              <Route path="/admin/settings"  element={<Settings />} />
              <Route path="/admin/authors"      element={<Authors />} />
              <Route path="/admin/publishers"   element={<Publishers />} />
              <Route path="/admin/categories"   element={<Categories />} />
          */}
        </Route>
      </Route>

      {/* Redirect /admin → /admin/dashboard */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
};

// ── App ───────────────────────────────────────────────────────
const App = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);

export default App;