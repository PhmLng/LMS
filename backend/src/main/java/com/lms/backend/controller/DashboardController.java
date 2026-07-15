package com.lms.backend.controller;

import com.lms.backend.common.response.ApiResponse;
import com.lms.backend.dto.dashboardDto.DashboardResponse;
import com.lms.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/dashboards")
@PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboardStats() {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(dashboardService.getDashboardStats()));
    }
}
