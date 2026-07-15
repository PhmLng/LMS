package com.lms.backend.dto.systemSettingDto;

import com.lms.backend.enums.SettingKey;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
public class SystemResponse {
    private Long id;
    private SettingKey settingKey;
    private String settingValue;
    private String description;
    private LocalDateTime updatedAt;
}
