package com.lms.backend.service.impl;

import com.lms.backend.service.ImageUploadService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class ImageUploadServiceImpl implements ImageUploadService {
    private final String UPLOAD_DIR = "uploads/";
    @Override
    public String storeFile(MultipartFile file) {
        try {
            File folder = new File(UPLOAD_DIR);
            if (!folder.exists()) folder.mkdirs();
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path targetLocation = Paths.get(UPLOAD_DIR).toAbsolutePath().resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return "http://localhost:8080/uploads/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Không thể lưu file. Vui lòng thử lại!", ex);
        }
    }
}
