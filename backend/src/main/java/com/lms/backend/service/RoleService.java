package com.lms.backend.service;

import com.lms.backend.dto.roleDto.RoleRequest;
import com.lms.backend.dto.roleDto.RoleResponse;

import java.util.List;

public interface RoleService {
    public List<RoleResponse> getAllRoles();
    public RoleResponse createRole(RoleRequest roleRequest);
    public void deleteRole(String name);
}
