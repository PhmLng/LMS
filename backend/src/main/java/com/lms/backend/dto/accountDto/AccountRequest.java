package com.lms.backend.dto.accountDto;

import com.lms.backend.dto.roleDto.RoleResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AccountRequest {
    private String fullname;
    private String username;
    private String password;
    private List<String> roles;
}
