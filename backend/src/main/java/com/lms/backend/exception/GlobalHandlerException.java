package com.lms.backend.exception;

import com.lms.backend.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalHandlerException {

    @ExceptionHandler(AppExcpetion.class)
    public ResponseEntity<ApiResponse<?>> handlingAppException(AppExcpetion appExcpetion) {
        ErrorCode errorCode = appExcpetion.getErrorCode();
        return ResponseEntity.status(errorCode.getHttpStatus()).body(ApiResponse.error(errorCode));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handlingException(Exception exception) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;
        return ResponseEntity.status(errorCode.getHttpStatus()).body(ApiResponse.error(errorCode));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handlingMethodArgumentException(MethodArgumentNotValidException exception) {
        String enumKey = exception.getBindingResult().getFieldError().getField();
        ErrorCode errorCode = Enum.valueOf(ErrorCode.class, enumKey);
        return ResponseEntity.status(errorCode.getHttpStatus()).body(ApiResponse.error(errorCode));
    }
}
