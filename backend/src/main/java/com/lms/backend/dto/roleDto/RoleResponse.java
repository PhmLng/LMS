package com.lms.backend.dto.roleDto;

import com.lms.backend.dto.permissionDto.PermissionResponse;
import lombok.Data;

import java.util.Set;

@Data
public class RoleResponse {
    private String name;
    private String description;
    private Set<PermissionResponse> permissions;
}
