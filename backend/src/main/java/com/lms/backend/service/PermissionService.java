package com.lms.backend.service;

import com.lms.backend.dto.permissionDto.PermissionRequest;
import com.lms.backend.dto.permissionDto.PermissionResponse;

import java.util.List;

public interface PermissionService {
    public List<PermissionResponse> getAllPermission();
    public PermissionResponse cratePermission(PermissionRequest permissionRequest);
}
