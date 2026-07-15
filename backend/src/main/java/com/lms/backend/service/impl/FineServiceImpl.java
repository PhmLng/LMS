package com.lms.backend.service.impl;

import com.lms.backend.dto.fineDto.FineResponse;
import com.lms.backend.entity.Fine;
import com.lms.backend.entity.LibraryCard;
import com.lms.backend.enums.FineStatus;
import com.lms.backend.mapper.FineMapper;
import com.lms.backend.repository.FineRepository;
import com.lms.backend.repository.LibraryCardRepository;
import com.lms.backend.service.FineService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FineServiceImpl implements FineService {

    private final FineRepository fineRepository;
    private final LibraryCardRepository libraryCardRepository;
    private final FineMapper fineMapper;

    @Override
    public Page<FineResponse> getFineByStatus(String cardCode,FineStatus status, Pageable pageable) {
        Long readerId = null;
        if (cardCode != null && !cardCode.trim().isEmpty()) {
            LibraryCard libraryCard = libraryCardRepository.findByCardCode(cardCode)
                    .orElseThrow(() -> new RuntimeException("card not found"));
            readerId = libraryCard.getReader().getId();
        }

        // 1. Lấy danh sách phiếu phạt phân trang (Chỉ có readerId)
        Page<Fine> fines = fineRepository.getAllFineByCondition(readerId, status, pageable);

        if (fines.isEmpty()) {
            return Page.empty(pageable);
        }

        // 2. Gom sạch các readerId duy nhất của TRANG HIỆN TẠI (Tối đa chỉ 10-20 cái)
        List<Long> readerIds = fines.getContent().stream()
                .map(Fine::getReaderId)
                .distinct()
                .collect(Collectors.toList());

        // 3. Đi chợ bốc toàn bộ thông tin Thẻ + Độc giả tương ứng với đống ID trên (Chỉ 1 câu lệnh SQL IN)
        List<LibraryCard> libraryCards = libraryCardRepository.findAllByReaderIdIn(readerIds);

        // Biến danh sách thẻ thành Map để tra cứu O(1) theo readerId cho nhanh
        Map<Long, LibraryCard> cardMap = libraryCards.stream()
                .collect(Collectors.toMap(card -> card.getReader().getId(), card -> card));

        // 4. Ráp dữ liệu tên và mã thẻ vào FineResponse mà KHÔNG sợ bị N+1
        Page<FineResponse> fineResponses = fines.map(fine -> {
            // Gọi mapper của ông như bình thường để map các trường cơ bản (amount, reason,...)
            FineResponse response = fineMapper.toFineResponse(fine);

            // Lấy thông tin thẻ từ Map ra để điền nốt Tên và Mã thẻ vào Response
            LibraryCard card = cardMap.get(fine.getReaderId());
            if (card != null) {
                response.setCardCode(card.getCardCode());
                response.setReaderName(card.getReader().getFullName()); // Ông check lại xem thực thể Reader dùng .getName() hay .getReaderName() nhé
            }

            return response;
        });

        return fineResponses;
    }
}
