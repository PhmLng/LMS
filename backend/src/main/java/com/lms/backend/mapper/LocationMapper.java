package com.lms.backend.mapper;

import com.lms.backend.dto.locationDto.LocationResponse;

public class LocationMapper {
    public static LocationResponse toLocationResponse(String locationStr) {
        if (locationStr == null || !locationStr.contains("-")) {
            return new LocationResponse(locationStr, "N/A", "N/A", "N/A");
        }

        String[] parts = locationStr.split("-");
        // Giả sử định dạng: A-01-05 (Khu-Kệ-Hàng)
        return new LocationResponse(
                locationStr,
                parts[0],
                parts.length > 1 ? parts[1] : "N/A",
                parts.length > 2 ? parts[2] : "N/A"
        );
    }
}
