package com.lms.backend.dto.accountDto;

import com.lms.backend.dto.roleDto.RoleResponseMinimal;
import lombok.Data;

import java.util.Set;

@Data
public class AccountResponse {
    private Long id;
    private String username;
    private Set<RoleResponseMinimal> role;
}
