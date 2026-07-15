package com.lms.backend.repository;

import com.lms.backend.entity.LibraryCard;
import com.lms.backend.enums.CardStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LibraryCardRepository extends JpaRepository<LibraryCard, Long> {
    Boolean existsByCardCode(String cardCode);

    @Query("SELECT MAX(lc.cardCode) FROM LibraryCard lc WHERE lc.cardCode LIKE :prefix")
    String findMaxCardCodeByPrefix(@Param("prefix") String prefix);

    @EntityGraph(attributePaths = {"reader",})
    Optional<Page<LibraryCard>> findAllByStatus(CardStatus status, Pageable pageable);
    @Override
    @EntityGraph(attributePaths = {"reader"})
    Optional<LibraryCard> findById(Long id);

    Optional<LibraryCard> findByCardCode(String cardCode);
    List<LibraryCard> findAllByReaderIdIn(List<Long> readerIds);
}
