package com.lms.backend.mapper;

import com.lms.backend.dto.staffDto.StaffRequest;
import com.lms.backend.dto.staffDto.StaffResponse;
import com.lms.backend.entity.Role;
import com.lms.backend.entity.Staff;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StaffMapper {
    @Mapping(target = "account", ignore = true)
    Staff toStaff(StaffRequest staffRequest);

    @Mapping(source = "account.roles", target = "roles")
    @Mapping(source = "account.status", target = "status")
    StaffResponse toStaffResponse(Staff staff);

    default String mapRoleToString(Role role) {
        if (role == null) {
            return null;
        }
        return role.getName();
    }
}
