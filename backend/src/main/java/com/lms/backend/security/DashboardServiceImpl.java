package com.lms.backend.security;

import com.lms.backend.dto.dashboardDto.BorrowTrendResponse;
import com.lms.backend.dto.dashboardDto.DashboardResponse;
import com.lms.backend.enums.BookCopyStatus;
import com.lms.backend.enums.BookStatus;
import com.lms.backend.repository.AccountRepository;
import com.lms.backend.repository.AuthorRepository;
import com.lms.backend.repository.BookCopyRepository;
import com.lms.backend.repository.BookRepository;
import com.lms.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final AuthorRepository authorRepository;
    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final AccountRepository accountRepository;
    @Override
    public DashboardResponse getDashboardStats() {
        DashboardResponse dashboardResponse = new DashboardResponse();
        dashboardResponse.setTotalBooks(bookRepository.countByStatus(BookStatus.AVAILABLE));
        dashboardResponse.setTotalAuthors(authorRepository.count());
        dashboardResponse.setTotalMembers(accountRepository.count());
        dashboardResponse.setTotalBookBorrowing(bookCopyRepository.countByStatus(BookCopyStatus.BORROWED));

        List<BorrowTrendResponse> borrowTrendResponses = new ArrayList<>();
        borrowTrendResponses.add(BorrowTrendResponse.builder().month("tháng 1").borrowCount(825).build());
        borrowTrendResponses.add(BorrowTrendResponse.builder().month("tháng 2").borrowCount(1100).build());
        borrowTrendResponses.add(BorrowTrendResponse.builder().month("tháng 3").borrowCount(1309).build());
        borrowTrendResponses.add(BorrowTrendResponse.builder().month("tháng 4").borrowCount(1207).build());
        borrowTrendResponses.add(BorrowTrendResponse.builder().month("tháng 5").borrowCount(1400).build());
        dashboardResponse.setTrends(borrowTrendResponses);
        return dashboardResponse;
    }
}
