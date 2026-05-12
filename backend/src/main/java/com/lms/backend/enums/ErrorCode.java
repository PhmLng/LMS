package com.lms.backend.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public enum ErrorCode {
    SUCCESS(1000,"Success"),
    NOT_FOUND(1001,"Not Found");


    private int code;
    private String message;
}
