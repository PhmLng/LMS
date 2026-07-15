package com.lms.backend.controller;

import com.lms.backend.common.response.ApiResponse;
import com.lms.backend.dto.permissionDto.PermissionRequest;
import com.lms.backend.dto.permissionDto.PermissionResponse;
import com.lms.backend.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/permissions")
@PreAuthorize("hasRole('ADMIN')")
public class PermissionController {
    private final PermissionService permissionService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<List<PermissionResponse>>> getAllPermissions() {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(permissionService.getAllPermission()));
    }

    @PostMapping("")
    public ResponseEntity<ApiResponse<PermissionResponse>> createPermission(@RequestBody PermissionRequest permissionRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(permissionService.cratePermission(permissionRequest)));
    }
}
