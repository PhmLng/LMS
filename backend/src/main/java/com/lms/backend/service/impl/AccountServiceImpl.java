package com.lms.backend.service.impl;

import com.lms.backend.dto.accountDto.AccountRequest;
import com.lms.backend.dto.accountDto.AccountResponse;
import com.lms.backend.dto.authDto.AuthRequest;
import com.lms.backend.entity.Account;
import com.lms.backend.entity.Role;
import com.lms.backend.enums.AccountStatus;
import com.lms.backend.mapper.AccountMapper;
import com.lms.backend.repository.AccountRepository;
import com.lms.backend.repository.RoleRepository;
import com.lms.backend.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    @Override
    public Account CreateAccount(AccountRequest accountRequest) {
        Account account = new Account();
        account.setUsername(accountRequest.getUsername());
        account.setFullname(accountRequest.getFullname());
        account.setPassword(passwordEncoder.encode(accountRequest.getPassword()));
        account.setStatus(AccountStatus.ACTIVE);
        account.setFullname(accountRequest.getFullname());
        List<Role> roles = roleRepository.findAllById(accountRequest.getRoles());
        account.setRoles(new HashSet<>(roles));
        accountRepository.save(account);
        return account;
    }

    @Override
    public Page<AccountResponse> getAllAccounts() {
        return null;
    }
}
