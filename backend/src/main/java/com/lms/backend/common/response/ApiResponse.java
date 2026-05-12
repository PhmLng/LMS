package com.lms.backend.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.lms.backend.enums.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse <T>{
    private Boolean success;
    private int code;
    private String message;
    private T data;

    public static <T> ApiResponse<T> success(){
        return new ApiResponse<>(true, ErrorCode.SUCCESS.getCode(), ErrorCode.SUCCESS.getMessage(), null);
    }
    public static <T> ApiResponse<T> success(T data){
        return  new ApiResponse<>(true,ErrorCode.SUCCESS.getCode(), ErrorCode.SUCCESS.getMessage(), data);
    }
    public static <T> ApiResponse<T> error(ErrorCode errorCode){
        return new ApiResponse<>(false, errorCode.getCode(),errorCode.getMessage(),null);
    }
}
