package com.lms.backend.dto.dashboardDto;

import lombok.Data;

import java.util.List;

@Data
public class DashboardResponse {
    private Long totalBooks;
    private Long totalMembers;
    private Long totalAuthors;
    private Long totalBookBorrowing;
    private List<BorrowTrendResponse> trends;
}
