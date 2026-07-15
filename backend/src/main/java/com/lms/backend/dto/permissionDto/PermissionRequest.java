package com.lms.backend.dto.permissionDto;

import lombok.Data;

@Data
public class PermissionRequest {
    private String permission;
    private String description;
}
