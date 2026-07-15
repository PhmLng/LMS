// ============================================================
// src/main.jsx
// Entry point của ứng dụng Vite + React.
// Import Ant Design CSS global ở đây để áp dụng cho toàn app.
// ============================================================

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Import CSS reset toàn cục (tùy chọn, để loại bỏ style mặc định của browser)
import "./index.css";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);