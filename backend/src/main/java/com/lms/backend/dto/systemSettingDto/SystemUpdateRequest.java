package com.lms.backend.dto.systemSettingDto;

import com.lms.backend.enums.SettingKey;
import lombok.Data;

@Data
public class SystemUpdateRequest {
    private SettingKey settingKey;
    private String settingValue;
    private String description;
}
