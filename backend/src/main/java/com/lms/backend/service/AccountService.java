package com.lms.backend.service;

import com.lms.backend.dto.accountDto.AccountRequest;
import com.lms.backend.dto.accountDto.AccountResponse;
import com.lms.backend.dto.authDto.AuthRequest;
import com.lms.backend.entity.Account;
import org.springframework.data.domain.Page;

public interface AccountService {
    public Account CreateAccount(AccountRequest accountRequest);
    public Page<AccountResponse> getAllAccounts();
}
