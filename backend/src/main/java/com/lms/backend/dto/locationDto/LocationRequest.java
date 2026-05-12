package com.lms.backend.dto.locationDto;

import lombok.Data;

@Data
public class LocationRequest {
    private String area;
    private String shelf;
    private String row;

    public String toRawString() {
        return String.format("%s-%s-%s", area, shelf, row);
    }
}
