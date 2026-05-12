package com.lms.backend.service.impl;

import com.lms.backend.entity.SystemSetting;
import com.lms.backend.enums.SettingKey;
import com.lms.backend.repository.SystemSettingRepository;
import com.lms.backend.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class SystemSettingServiceImpl implements SystemSettingService {
    private final SystemSettingRepository systemSettingRepository;

    @Override
    public BigDecimal getSettingValue(SettingKey key) {
        SystemSetting systemSetting = systemSettingRepository.findBySettingKey(key).orElseThrow(()->new RuntimeException("System setting not found"));
        BigDecimal settingValue = new BigDecimal(systemSetting.getSettingValue());
        return settingValue;
    }

    @Override
    public String getSettingValueDefault(SettingKey key) {
        SystemSetting systemSetting = systemSettingRepository.findBySettingKey(key).orElseThrow(()->new RuntimeException("System setting not found"));
        return systemSetting.getSettingValue();
    }
}
