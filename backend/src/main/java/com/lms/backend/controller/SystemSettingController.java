package com.lms.backend.controller;

import com.lms.backend.common.response.ApiResponse;
import com.lms.backend.dto.systemSettingDto.SystemResponse;
import com.lms.backend.dto.systemSettingDto.SystemUpdateRequest;
import com.lms.backend.entity.SystemSetting;
import com.lms.backend.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/settings")
public class SystemSettingController {
    private final SystemSettingService systemSettingService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<Page<SystemResponse>>> getAllSystemSettings(@PageableDefault(size = 10, page = 0) Pageable pageable) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(systemSettingService.getAllSystemSettings(pageable)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("")
    public ResponseEntity<ApiResponse<Void>> updateSystemSetting(@RequestBody List<SystemUpdateRequest> systemUpdateRequests) {
        systemSettingService.updateSettingValue(systemUpdateRequests);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success());
    }
}
