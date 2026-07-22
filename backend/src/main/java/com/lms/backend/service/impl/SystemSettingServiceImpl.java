package com.lms.backend.service.impl;

import com.lms.backend.dto.systemSettingDto.SystemResponse;
import com.lms.backend.dto.systemSettingDto.SystemUpdateRequest;
import com.lms.backend.entity.SystemSetting;
import com.lms.backend.enums.SettingKey;
import com.lms.backend.exception.AppExcpetion;
import com.lms.backend.exception.ErrorCode;
import com.lms.backend.mapper.SystemSettingMapper;
import com.lms.backend.repository.SystemSettingRepository;
import com.lms.backend.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemSettingServiceImpl implements SystemSettingService {
    private final SystemSettingRepository systemSettingRepository;
    private final SystemSettingMapper systemSettingMapper;

    @Override
    public BigDecimal getSettingValue(SettingKey key) {
        SystemSetting systemSetting = systemSettingRepository.findBySettingKey(key).orElseThrow(()->new AppExcpetion(ErrorCode.SYSTEM_SETTINGS_NOT_FOUND));
        BigDecimal settingValue = new BigDecimal(systemSetting.getSettingValue());
        return settingValue;
    }

    @Override
    public String getSettingValueDefault(SettingKey key) {
        SystemSetting systemSetting = systemSettingRepository.findBySettingKey(key).orElseThrow(()->new AppExcpetion(ErrorCode.SYSTEM_SETTINGS_NOT_FOUND));
        return systemSetting.getSettingValue();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateSettingValue(List<SystemUpdateRequest> systemUpdateRequests) {
        List<SystemSetting> allSettings = systemSettingRepository.findAll();

        Map<SettingKey,SystemSetting> systemSettingMap =allSettings.stream().collect(Collectors.toMap(SystemSetting::getSettingKey,systemSetting->systemSetting));

        List<SystemSetting> settingsToSave = new ArrayList<>();

        for (SystemUpdateRequest systemUpdateRequest : systemUpdateRequests) {
            SystemSetting setting = systemSettingMap.get(systemUpdateRequest.getSettingKey());
            if (setting!=null) {
                setting.setSettingValue(systemUpdateRequest.getSettingValue());
                setting.setDescription(systemUpdateRequest.getDescription());
                setting.setUpdatedAt(LocalDateTime.now());
                settingsToSave.add(setting);
            }else {
                throw new AppExcpetion(ErrorCode.SYSTEM_SETTINGS_NOT_FOUND);
            }
            systemSettingRepository.saveAll(settingsToSave);
        }
    }

    @Override
    public Page<SystemResponse> getAllSystemSettings(Pageable pageable) {
        Page<SystemSetting> systemSettings = systemSettingRepository.findAll(pageable);
        return systemSettings.map(systemSettingMapper::toSystemResponse);
    }

}
