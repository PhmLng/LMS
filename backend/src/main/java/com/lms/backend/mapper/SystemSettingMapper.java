package com.lms.backend.mapper;

import com.lms.backend.dto.systemSettingDto.SystemResponse;
import com.lms.backend.entity.SystemSetting;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SystemSettingMapper {
    SystemResponse toSystemResponse(SystemSetting systemSetting);
}
