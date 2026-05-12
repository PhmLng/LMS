package com.lms.backend.entity;

import com.lms.backend.enums.SettingKey;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_settings")
@Data
public class SystemSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "setting_key")
    @Enumerated(EnumType.STRING)
    private SettingKey settingKey;

    @Column(name = "setting_value")
    private String settingValue;

    @Column(name = "description")
    private String description;

    @Column(name = "updated_at")
    @CreationTimestamp
    private LocalDateTime updatedAt;
}
