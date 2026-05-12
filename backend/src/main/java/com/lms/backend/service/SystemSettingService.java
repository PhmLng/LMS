package com.lms.backend.service;

import com.lms.backend.enums.SettingKey;

import java.math.BigDecimal;

public interface SystemSettingService {
    public  BigDecimal getSettingValue(SettingKey key);
    public String getSettingValueDefault(SettingKey key);
}
