package com.lms.backend.service.impl;

import com.lms.backend.dto.permissionDto.PermissionRequest;
import com.lms.backend.dto.permissionDto.PermissionResponse;
import com.lms.backend.entity.Permission;
import com.lms.backend.mapper.PermissionMapper;
import com.lms.backend.repository.PermissionRepository;
import com.lms.backend.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;
    private final PermissionMapper permissionMapper;
    @Override
    public List<PermissionResponse> getAllPermission() {
        List<Permission> permissions = permissionRepository.findAll();
        return permissions.stream().map(permissionMapper::toPermissionResponse).toList();
    }

    @Override
    public PermissionResponse cratePermission(PermissionRequest permissionRequest) {
       Permission permission = permissionMapper.toPermission(permissionRequest);
       permission = permissionRepository.save(permission);
       return permissionMapper.toPermissionResponse(permission);
    }
}
