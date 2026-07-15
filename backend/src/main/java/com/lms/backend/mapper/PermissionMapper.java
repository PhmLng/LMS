package com.lms.backend.mapper;

import com.lms.backend.dto.permissionDto.PermissionRequest;
import com.lms.backend.dto.permissionDto.PermissionResponse;
import com.lms.backend.entity.Permission;
import org.mapstruct.Mapper;
import org.springframework.security.access.prepost.PreAuthorize;

@Mapper(componentModel = "spring")

public interface PermissionMapper {
    PermissionResponse toPermissionResponse(Permission permission);
    Permission toPermission(PermissionRequest permissionRequest);
}
