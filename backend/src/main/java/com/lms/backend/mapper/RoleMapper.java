package com.lms.backend.mapper;

import com.lms.backend.dto.roleDto.RoleRequest;
import com.lms.backend.dto.roleDto.RoleResponse;
import com.lms.backend.dto.roleDto.RoleResponseMinimal;
import com.lms.backend.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest roleRequest);

    RoleResponse toRoleResponse(Role role);

    RoleResponseMinimal toRoleResponseMininal(Role role);
}
