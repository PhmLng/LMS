package com.lms.backend.repository;

import com.lms.backend.entity.SystemSetting;
import com.lms.backend.enums.SettingKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.Optional;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {
    Optional<SystemSetting> findBySettingKey(SettingKey settingKey);
}
