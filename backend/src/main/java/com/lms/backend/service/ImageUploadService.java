package com.lms.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface ImageUploadService {
    public String storeFile(MultipartFile file);
}
