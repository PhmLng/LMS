package com.lms.backend.controller;

import com.lms.backend.common.response.ApiResponse;
import com.lms.backend.dto.staffDto.StaffRegistrationRequest;
import com.lms.backend.dto.staffDto.StaffResponse;
import com.lms.backend.enums.AccountStatus;
import com.lms.backend.service.RegistrationService;
import com.lms.backend.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/staffs")
@PreAuthorize("hasRole('ADMIN')")
public class StaffController {
    private final RegistrationService registrationService;
    private final StaffService staffService;

    @GetMapping()
    public ResponseEntity<ApiResponse<Page<StaffResponse>>> getAllStaff(@PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable, @RequestParam(required = false) AccountStatus status,@RequestParam(required = false) String role) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(staffService.getAllStaff(pageable, status, role)));
    }
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<StaffResponse>> getStaffByName(@RequestParam String name) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(staffService.getStaffByName(name)));
    }
    @PutMapping("/{id}/lock")
    public ResponseEntity<ApiResponse<Void>> lockStaff(@PathVariable Long id) {
        staffService.lockStaff(id);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success());
    }
    @PutMapping("/{id}/unlock")
    public ResponseEntity<ApiResponse<Void>> unlockStaff(@PathVariable Long id) {
        staffService.unlockStaff(id);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success());
    }
    @PostMapping("")
    public ResponseEntity<ApiResponse<StaffResponse>> createStaff(@RequestBody StaffRegistrationRequest staffRegistrationRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(registrationService.registerNewStaff(staffRegistrationRequest)));
    }

}
