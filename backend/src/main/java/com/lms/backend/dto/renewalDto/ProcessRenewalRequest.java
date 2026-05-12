package com.lms.backend.dto.renewalDto;

import com.lms.backend.enums.RenewalStatus;
import lombok.Data;

@Data
public class ProcessRenewalRequest {
    private Long renewalId;
    private RenewalStatus action;
}
