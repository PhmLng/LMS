package com.lms.backend.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

@AllArgsConstructor
@NoArgsConstructor
@Getter
public enum ErrorCode {

    SUCCESS(1000, "Success", HttpStatus.OK),
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    NOT_FOUND(1001, "Resource not found", HttpStatus.NOT_FOUND),
    UNAUTHORIZED(1002, "You don't have permission", HttpStatus.FORBIDDEN),
    UNAUTHENTICATED(1003, "Unauthorized access", HttpStatus.UNAUTHORIZED),
    INVALID_REFRESH_TOKEN(1004, "Incorrect refresh token", HttpStatus.BAD_REQUEST),

    // --- 2xxx: KHU VỰC AUTH & USER ---
    USER_EXISTED(2001, "User already exists", HttpStatus.CONFLICT),
    INVALID_USERNAME(2002, "Invalid username", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(2003, "Password must be at least 5 characters...", HttpStatus.BAD_REQUEST),
    FULLNAME_MISSING(2004, "Fullname is missing", HttpStatus.BAD_REQUEST),
    LOGIN_FAIL(2005, "Incorrect username or password", HttpStatus.BAD_REQUEST),
    STAFF_NOT_FOUND(2006, "Staff not found", HttpStatus.NOT_FOUND),
    STAFF_EXISTED(2007, "Staff already exists", HttpStatus.CONFLICT),
    ACCESS_DENIED(2008, "Access denied", HttpStatus.FORBIDDEN),
    ACCOUNT_NOT_FOUND(2009, "Account not found", HttpStatus.NOT_FOUND),

    // --- 3xxx: KHU VỰC SÁCH & THƯ VIỆN  ---
    BOOK_EXISTED(3001, "Book already exists in system", HttpStatus.CONFLICT),
    BOOK_NOT_FOUND(3002, "Book not found", HttpStatus.NOT_FOUND),
    CATEGORY_NOT_FOUND(3003, "Category not found", HttpStatus.NOT_FOUND),
    CATEGORY_EXISTED(3004, "Category already exists", HttpStatus.CONFLICT),
    AUTHOR_NOT_FOUND(3005, "Author not found", HttpStatus.NOT_FOUND),
    AUTHOR_EXISTED(3006, "Author already exists", HttpStatus.CONFLICT),
    PUBLISHER_NOT_FOUND(3007, "Publisher not found", HttpStatus.NOT_FOUND),
    PUBLISHER_EXISTED(3008, "Publisher already exists", HttpStatus.CONFLICT),
    CARD_NOT_FOUND(3009, "Card not found", HttpStatus.NOT_FOUND),
    CARD_EXISTED(3010, "Card already exists", HttpStatus.BAD_REQUEST),
    CARD_LOCKED(3011, "Card locked", HttpStatus.BAD_REQUEST),
    LOAN_DETAIL_NOT_FOUND(3012, "Loan detail not found", HttpStatus.NOT_FOUND),
    LOAN_SLIP_NOT_FOUND(3013, "Loan slip not found", HttpStatus.NOT_FOUND),
    LOAN_SLIP_EXISTED(3014, "Loan slip already exists", HttpStatus.CONFLICT),

    BORROW_LIMIT_EXCEEDED(3015,"exceeding the borrowing limit",HttpStatus.BAD_REQUEST),
    OVERDUE_LOAN_EXISTS(3016,"User has overdue loans", HttpStatus.CONFLICT),

    BOOK_COPY_UNAVAILABLE(3017,"Book copies unavailable", HttpStatus.BAD_REQUEST),
    SYSTEM_SETTINGS_NOT_FOUND(3018,"System settings not found", HttpStatus.NOT_FOUND),
    RENEWAL_NOT_FOUND(3401, "Renewal not found", HttpStatus.NOT_FOUND),
    LOAN_DETAIL_NOT_OWNED(3402,"Loan detail does not belong to current reader", HttpStatus.FORBIDDEN),
    RENEWAL_ALREADY_PENDING(3403,"A renewal request is already pending", HttpStatus.CONFLICT),
    RENEWAL_LIMIT_EXCEEDED(3404,"Renewal limit exceeded",HttpStatus.BAD_REQUEST),
    INVALID_RENEWAL_DATE(3405, "Invalid renewal date",HttpStatus.BAD_REQUEST),
    RENEWAL_NOT_ALLOWED(3406, "Renewal is not allowed",HttpStatus.BAD_REQUEST),

    PAYMENT_LIST_MISSING(4004, "Payment list is missing", HttpStatus.BAD_REQUEST);
    private int code;
    private String message;
    private HttpStatus httpStatus;

}
