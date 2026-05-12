package com.lms.backend.dto.locationDto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LocationResponse {

    private String rawString;
    private String area;
    private String shelf;
    private String row;
}
