package com.lms.backend.repository;

import com.lms.backend.entity.InvalidatedToken;
import org.springframework.data.repository.CrudRepository;

public interface InvalidatedTokenRepository extends CrudRepository<InvalidatedToken, String> {
}
