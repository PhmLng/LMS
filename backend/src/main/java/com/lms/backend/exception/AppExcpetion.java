package com.lms.backend.exception;


import lombok.Data;

@Data
public class AppExcpetion extends RuntimeException {

    private ErrorCode errorCode;
    public AppExcpetion(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
