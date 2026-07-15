// ============================================================
// src/pages/Home/index.jsx
// Trang chủ: Hero + Dynamic Search + Category Filter + Book Grid
//
// State flow:
//   searchText       → controlled input (gõ chữ, chưa submit)
//   searchQuery      → từ khóa đã xác nhận (trigger API)
//   selectedCategory → ID thể loại đang lọc (undefined = Tất cả)
//   currentPage      → trang hiện tại (one-indexed)
//   categories       → danh sách thể loại từ DB
//   isExpanded       → ẩn/hiện panel "Xem thêm"
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Input, Button, List, Card, Tag, Pagination, Empty, Alert,
} from "antd";
import { SearchOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import { searchBooksApi } from "../../services/bookService";
import { getCategoriesApi } from "../../services/categoryService";
import "./Home.css";

// ── Hằng số ──────────────────────────────────────────────────
const PAGE_SIZE = 15;
const VISIBLE_CATS = 5;   // số thể loại hiển thị ở dòng đầu
const PLACEHOLDER = "https://placehold.co/200x260/c8d8f0/0d2461?text=Sách";
const SUGGESTIONS = ["Kiến trúc hiện đại", "Quy hoạch đô thị", "Lịch sử mỹ thuật"];

// ── Helpers ──────────────────────────────────────────────────
const resolveImage = (url) =>
    !url || url.trim() === "" || url === "string" ? PLACEHOLDER : url;

const STATUS_MAP = {
    AVAILABLE: { color: "success", label: "Còn sách" },
    BORROWED: { color: "error", label: "Đang mượn" },
    UNAVAILABLE: { color: "default", label: "Không có" },
    LOST: { color: "warning", label: "Đã mất" },
};

// ── Sub-components ────────────────────────────────────────────

const StatusTag = ({ status }) => {
    const cfg = STATUS_MAP[status] ?? { color: "default", label: status ?? "—" };
    return <Tag color={cfg.color} className="book-status-tag">{cfg.label}</Tag>;
};

const BookCard = ({ book }) => (
    <Card
        hoverable
        className="book-card-antd"
        cover={
            <div className="book-cover-wrapper">
                <img
                    src={resolveImage(book.imageUrl)}
                    alt={book.title}
                    className="book-cover-img"
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                />
                <div className="book-status-overlay">
                    <StatusTag status={book.status} />
                </div>
            </div>
        }
    >
        <Card.Meta
            title={
                <span className="book-card-title" title={book.title}>
                    {book.title}
                </span>
            }
            description={
                <div className="book-card-meta">
                    <p className="book-card-author">{book.author}</p>
                    <p className="book-card-publisher">{book.publisher}</p>
                </div>
            }
        />
    </Card>
);

/**
 * Skeleton loading — .fill({}) tạo object rỗng thật sự.
 * KHÔNG dùng Array.from({length}) vì tạo [undefined x N] → crash Antd List.
 */
const BookSkeletonGrid = () => (
    <List
        grid={{ gutter: 16, column: 5 }}
        dataSource={Array.from({ length: PAGE_SIZE }).fill({})}
        rowKey={(_, i) => `skeleton_${i}`}
        renderItem={(_, i) => (
            <List.Item key={`skeleton_${i}`}>
                <div className="book-skeleton-card">
                    <div className="book-skeleton-cover" />
                    <div className="book-skeleton-body">
                        <div className="book-skeleton-line long" />
                        <div className="book-skeleton-line short" />
                        <div className="book-skeleton-line short" />
                    </div>
                </div>
            </List.Item>
        )}
    />
);

/**
 * CategoryFilter — hiển thị bộ lọc thể loại động.
 *
 * Layout:
 *   [Tất cả] [Cat1] [Cat2] [Cat3] [Cat4] [Cat5]  [Xem thêm ▾]
 *   ── khi isExpanded = true ──────────────────────────────────
 *   | Cat6  Cat7  Cat8  Cat9  Cat10 |
 *   | Cat11 Cat12 ...               |  (grid 5 cột tự xuống dòng)
 *   ───────────────────────────────────────────────────────────
 */
const CategoryFilter = ({ categories, selectedCategory, onSelect }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const panelRef = useRef(null);

    const visibleCats = categories.slice(0, VISIBLE_CATS);
    const hiddenCats = categories.slice(VISIBLE_CATS);
    const hasMore = hiddenCats.length > 0;

    // Đóng panel khi click ra ngoài
    useEffect(() => {
        if (!isExpanded) return;
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setIsExpanded(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isExpanded]);

    const handleSelect = (id) => {
        // Click lại chính nó → bỏ lọc (toggle)
        onSelect(selectedCategory === id ? undefined : id);
        setIsExpanded(false);
    };

    return (
        <div className="category-filter-wrapper" ref={panelRef}>
            {/* ── Dòng chính ── */}
            <div className="category-row">
                {/* Nút "Tất cả" */}
                <button
                    className={`cat-chip ${selectedCategory === undefined ? "active" : ""}`}
                    onClick={() => onSelect(undefined)}
                >
                    Tất cả
                </button>

                {/* 5 thể loại đầu */}
                {visibleCats.map((cat) => (
                    <button
                        key={cat.id}
                        className={`cat-chip ${selectedCategory === cat.id ? "active" : ""}`}
                        onClick={() => handleSelect(cat.id)}
                    >
                        {cat.name}
                    </button>
                ))}

                {/* Nút Xem thêm — chỉ hiện khi có thể loại ẩn */}
                {hasMore && (
                    <button
                        className={`cat-chip more-btn ${isExpanded ? "expanded" : ""}`}
                        onClick={() => setIsExpanded((v) => !v)}
                        aria-expanded={isExpanded}
                    >
                        {isExpanded ? "Thu gọn" : "Xem thêm"}
                        {isExpanded
                            ? <UpOutlined className="more-icon" />
                            : <DownOutlined className="more-icon" />}
                    </button>
                )}
            </div>

            {/* ── Panel mở rộng (slide-down) ── */}
            {isExpanded && hiddenCats.length > 0 && (
                <div className="category-panel">
                    <div className="category-panel-grid">
                        {hiddenCats.map((cat) => (
                            <button
                                key={cat.id}
                                className={`cat-chip panel-chip ${selectedCategory === cat.id ? "active" : ""}`}
                                onClick={() => handleSelect(cat.id)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Component chính ───────────────────────────────────────────
const HomePage = () => {

    // Search states
    const [searchText, setSearchText] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState(undefined);
    const [categories, setCategories] = useState([]);

    // Pagination & data states
    const [currentPage, setCurrentPage] = useState(1);
    const [books, setBooks] = useState([]);
    const [totalElements, setTotalElements] = useState(0);

    // UI states
    const [loading, setLoading] = useState(false);
    const [catLoading, setCatLoading] = useState(false);
    const [error, setError] = useState(null);

    // ── Fetch danh sách thể loại (chỉ gọi 1 lần khi mount) ──
    useEffect(() => {
        const fetchCategories = async () => {
            setCatLoading(true);
            try {
                const result = await getCategoriesApi();
                if (result.success) {
                    setCategories(result.data?.content ?? []);
                }
            } catch {
                // Thể loại lỗi không block UX chính → im lặng
            } finally {
                setCatLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // ── Fetch sách — trigger khi currentPage / selectedCategory / searchQuery đổi ──
    const fetchBooks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await searchBooksApi({
                page: currentPage,
                size: PAGE_SIZE,
                title: searchQuery || undefined,
                categoryId: selectedCategory || undefined,
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
                "Lỗi kết nối đến máy chủ. Vui lòng thử lại sau."
            );
            setBooks([]);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, selectedCategory, searchQuery]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    // ── Event handlers ────────────────────────────────────────

    /** Bấm "Tra cứu" hoặc Enter → xác nhận searchQuery + reset trang */
    const handleSearch = useCallback(() => {
        setSearchQuery(searchText.trim());
        setCurrentPage(1);
    }, [searchText]);

    /** Gợi ý nhanh */
    const handleSuggestion = (text) => {
        setSearchText(text);
        setSearchQuery(text);
        setCurrentPage(1);
    };

    /** Xóa ô search */
    const handleClear = () => {
        setSearchText("");
        setSearchQuery("");
        setCurrentPage(1);
    };

    /** Chọn thể loại → reset trang */
    const handleCategorySelect = (id) => {
        setSelectedCategory(id);
        setCurrentPage(1);
    };

    /** Chuyển trang — giữ nguyên filter */
    const handlePageChange = (page) => {
        setCurrentPage(page);
        document.getElementById("catalog-section")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    // ── Render ────────────────────────────────────────────────
    return (
        <div className="home-page">

            {/* ═══════════════ HERO ═══════════════ */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Khám phá Kho Lưu Trữ Kiến Trúc</h1>

                    <div className="search-bar-wrapper">
                        <Input
                            prefix={<SearchOutlined className="search-icon" />}
                            placeholder="Tìm tên sách, tác giả, ISBN..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onPressEnter={handleSearch}
                            className="search-input"
                            size="large"
                            allowClear
                            onClear={handleClear}
                        />
                        <Button
                            type="primary"
                            className="search-btn"
                            onClick={handleSearch}
                            loading={loading}
                            size="large"
                        >
                            Tra<br />Cứu
                        </Button>
                    </div>

                    <div className="search-suggestions">
                        <span className="suggestion-label">Gợi ý:</span>
                        {SUGGESTIONS.map((s) => (
                            <button key={s} className="suggestion-chip"
                                onClick={() => handleSuggestion(s)}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ CATALOG ═══════════════ */}
            <section className="catalog-section" id="catalog-section">
                <div className="catalog-container">

                    {/* Header */}
                    <div className="catalog-header">
                        <div>
                            <h2 className="catalog-title">Tra Cứu Tài Liệu</h2>
                            {!loading && !error && (
                                <p className="catalog-subtitle">
                                    {totalElements > 0
                                        ? `Hiển thị trang ${currentPage} — tổng ${totalElements.toLocaleString("vi-VN")} kết quả`
                                        : searchQuery
                                            ? `Không tìm thấy kết quả cho "${searchQuery}"`
                                            : "Không có kết quả"}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Bộ lọc thể loại động */}
                    {!catLoading && categories.length > 0 && (
                        <CategoryFilter
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onSelect={handleCategorySelect}
                        />
                    )}

                    {/* Lỗi */}
                    {error && (
                        <Alert
                            message="Không thể tải dữ liệu"
                            description={error}
                            type="error"
                            showIcon
                            closable
                            onClose={() => setError(null)}
                            style={{ marginBottom: 24 }}
                            action={
                                <Button size="small" onClick={fetchBooks}>Thử lại</Button>
                            }
                        />
                    )}

                    {/* Grid sách */}
                    {loading ? (
                        <BookSkeletonGrid />
                    ) : !error && books.length === 0 ? (
                        <Empty
                            description={
                                searchQuery
                                    ? `Không tìm thấy sách nào với từ khóa "${searchQuery}"`
                                    : "Chưa có sách nào trong thư viện"
                            }
                            style={{ margin: "60px 0" }}
                        />
                    ) : (
                        <List
                            grid={{ gutter: 16, column: 5 }}
                            dataSource={books}
                            rowKey={(item) => item?.id || item?.title || Math.random().toString()}
                            renderItem={(item) => {
                                if (!item) return null;
                                return (
                                    <List.Item>
                                        <BookCard book={item} />
                                    </List.Item>
                                );
                            }}
                        />
                    )}

                    {/* Pagination */}
                    {!loading && !error && totalElements > 0 && (
                        <div className="pagination-wrapper">
                            <Pagination
                                current={currentPage}
                                pageSize={PAGE_SIZE}
                                total={totalElements}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                                showQuickJumper={totalElements > PAGE_SIZE * 5}
                                showTotal={(total, range) =>
                                    `${range[0]}–${range[1]} / ${total} tài liệu`
                                }
                            />
                        </div>
                    )}

                </div>
            </section>
        </div>
    );
};

export default HomePage;