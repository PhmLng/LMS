package com.lms.backend.service;

import com.lms.backend.dto.systemSettingDto.SystemResponse;
import com.lms.backend.dto.systemSettingDto.SystemUpdateRequest;
import com.lms.backend.enums.SettingKey;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface SystemSettingService {
    public  BigDecimal getSettingValue(SettingKey key);
    public String getSettingValueDefault(SettingKey key);
    public void updateSettingValue(List<SystemUpdateRequest> systemUpdateRequests);
    public Page<SystemResponse> getAllSystemSettings(Pageable pageable);
}
