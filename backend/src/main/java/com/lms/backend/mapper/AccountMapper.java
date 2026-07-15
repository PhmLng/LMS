package com.lms.backend.mapper;

import com.lms.backend.dto.accountDto.AccountInfor;
import com.lms.backend.dto.accountDto.AccountResponse;
import com.lms.backend.entity.Account;
import com.lms.backend.entity.Role;
import org.mapstruct.Mapper;


@Mapper(componentModel = "spring",uses = {RoleMapper.class})
public interface AccountMapper {
    AccountResponse toAccountResponse(Account account);
    AccountInfor toAccountInfor(Account account);
}
