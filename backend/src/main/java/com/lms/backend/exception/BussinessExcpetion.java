package com.lms.backend.exception;

import com.lms.backend.enums.ErrorCode;
import lombok.Data;

@Data
public class BussinessExcpetion extends RuntimeException {
  private ErrorCode errorCode;
    public BussinessExcpetion(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
