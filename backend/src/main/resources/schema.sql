-- TẦNG 1: ĐỘC LẬP
CREATE TABLE accounts (
                          id BIGINT PRIMARY KEY AUTO_INCREMENT,
                          username VARCHAR(50) UNIQUE NOT NULL,
                          password VARCHAR(255) NOT NULL,
                          status VARCHAR(20) NOT NULL,
                          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- Bảng trung gian Role - Permission
CREATE TABLE roles_permissions (
                                   role_name VARCHAR(50) NOT NULL,
                                   permission_name VARCHAR(50) NOT NULL,
                                   PRIMARY KEY (role_name, permission_name),
                                   CONSTRAINT fk_rp_role FOREIGN KEY (role_name) REFERENCES roles(name),
                                   CONSTRAINT fk_rp_perm FOREIGN KEY (permission_name) REFERENCES permissions(permission)
);

-- Bảng trung gian Account - Role
CREATE TABLE accounts_roles (
                                account_id BIGINT NOT NULL,
                                role_name VARCHAR(50) NOT NULL,
                                PRIMARY KEY (account_id, role_name),
                                CONSTRAINT fk_ar_account FOREIGN KEY (account_id) REFERENCES accounts(id),
                                CONSTRAINT fk_ar_role FOREIGN KEY (role_name) REFERENCES roles(name)
);

CREATE TABLE authors (
                         id BIGINT PRIMARY KEY AUTO_INCREMENT,
                         name VARCHAR(100) NOT NULL,
                         description TEXT
);

CREATE TABLE publishers (
                            id BIGINT PRIMARY KEY AUTO_INCREMENT,
                            name VARCHAR(100) NOT NULL,
                            description TEXT
);

CREATE TABLE categories (
                            id BIGINT PRIMARY KEY AUTO_INCREMENT,
                            name VARCHAR(100) NOT NULL,
                            description TEXT
);

CREATE TABLE readers (
                         id BIGINT PRIMARY KEY AUTO_INCREMENT,
                         full_name VARCHAR(100) NOT NULL,
                         email VARCHAR(100) UNIQUE,
                         phone_number VARCHAR(20),
                         address VARCHAR(255),
                         gender VARCHAR(10),
                         date_of_birth DATE,
                         account_id BIGINT UNIQUE,
                         CONSTRAINT fk_reader_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
);

CREATE TABLE books (
                       id BIGINT PRIMARY KEY AUTO_INCREMENT,
                       title VARCHAR(255) NOT NULL,
                       isbn VARCHAR(20) UNIQUE,
                       image_url VARCHAR(255),
                       publish_year INT,
                       status VARCHAR(50) DEFAULT 'AVAILABLE',
                       is_deleted BOOLEAN DEFAULT FALSE,
                       author_id BIGINT,
                       publisher_id BIGINT,
                       price DECIMAL(19, 2) DEFAULT 0.00,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                       CONSTRAINT fk_book_author FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL,
                       CONSTRAINT fk_book_publisher FOREIGN KEY (publisher_id) REFERENCES publishers(id) ON DELETE SET NULL
);

CREATE TABLE categories_books (
                                  category_id BIGINT,
                                  book_id BIGINT,
                                  PRIMARY KEY (category_id, book_id),
                                  CONSTRAINT fk_cb_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
                                  CONSTRAINT fk_cb_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE library_cards (
                               id BIGINT PRIMARY KEY AUTO_INCREMENT,
                               card_code VARCHAR(20) UNIQUE NOT NULL,
                               issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                               expiry_date DATETIME NOT NULL,
                               status VARCHAR(20),
                               reader_id BIGINT UNIQUE,
                               CONSTRAINT fk_card_reader FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE CASCADE
);

CREATE TABLE book_copies (
                             id BIGINT PRIMARY KEY AUTO_INCREMENT,
                             barcode VARCHAR(50) UNIQUE NOT NULL,
                             location VARCHAR(100),
                             status VARCHAR(20), -- AVAILABLE, BORROWED, LOST
                             is_deleted BOOLEAN DEFAULT FALSE,
                             book_id BIGINT,
                             CONSTRAINT fk_book_copy_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);


CREATE TABLE loan_slips (
                            id BIGINT PRIMARY KEY AUTO_INCREMENT,
                            borrow_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                            status VARCHAR(20), -- BORROWING, PARTIALLY_RETURNED, COMPLETED, OVERDUE
                            card_id BIGINT NOT NULL,
                            CONSTRAINT fk_loan_card FOREIGN KEY (card_id) REFERENCES library_cards(id)
);

CREATE TABLE loan_details (
                              id BIGINT PRIMARY KEY AUTO_INCREMENT,
                              loan_slip_id BIGINT NOT NULL,
                              book_copy_id BIGINT NOT NULL,
                              due_date DATE NOT NULL, -- Di chuyển từ cha xuống con
                              return_date DATETIME,       -- Ngày thực tế trả (null khi đang mượn)
                              status VARCHAR(20),         -- BORROWING, RETURNED, OVERDUE, LOST, DAMAGED
                              CONSTRAINT fk_ld_loan FOREIGN KEY (loan_slip_id) REFERENCES loan_slips(id) ON DELETE CASCADE,
                              CONSTRAINT fk_ld_copy FOREIGN KEY (book_copy_id) REFERENCES book_copies(id)
);

CREATE TABLE renewals (
                          id BIGINT PRIMARY KEY AUTO_INCREMENT,
                          request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                          old_due_date DATE NOT NULL,
                          new_date DATE NOT NULL,
                          status VARCHAR(20),
                          loan_slip_id BIGINT,
                          CONSTRAINT fk_renewal_loan FOREIGN KEY (loan_slip_id) REFERENCES loan_slips(id) ON DELETE CASCADE
);

CREATE TABLE payments (
                          id BIGINT PRIMARY KEY AUTO_INCREMENT,
                          transaction_code VARCHAR(100) UNIQUE,
                          payment_status VARCHAR(20),
                          payment_method VARCHAR(50),
                          amount DECIMAL(15, 2) NOT NULL,
                          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fines (
                       id BIGINT PRIMARY KEY AUTO_INCREMENT,
                       amount DECIMAL(15, 2) NOT NULL,
                       reason TEXT,
                       status VARCHAR(20),
                       loan_detail_id BIGINT,
                       payment_id BIGINT,
                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                       CONSTRAINT fk_fine_loan_detail FOREIGN KEY (loan_detail_id) REFERENCES loan_details(id),
                       CONSTRAINT fk_fine_payment FOREIGN KEY (payment_id) REFERENCES payments(id)
);
CREATE TABLE system_settings (
                        id BIGINT PRIMARY KEY AUTO_INCREMENT,
                        setting_key VARCHAR(100) NOT NULL UNIQUE,
                        setting_value VARCHAR(255) NOT NULL,
                        description VARCHAR(255),
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);