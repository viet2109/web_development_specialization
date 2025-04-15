package com.studyapp.be.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.studyapp.be.dao.FileDao;
import com.studyapp.be.entities.File;
import com.studyapp.be.enums.AppError;
import com.studyapp.be.exceptions.AppException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {
    private final FileDao fileDao;
    private final SecurityService securityService;
    private final Cloudinary storage;

    @Value("${app.cloud-storage.asset-folder}")
    private String assetFolder;

    @Transactional
    public File upload(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new AppException(AppError.FILE_UPLOAD_FAILED);
        String mimeType = getMimetype(file);
        Map params = ObjectUtils.asMap("folder", assetFolder, "resource_type", mimeType);
        try {
            Map result = storage.uploader().upload(file.getInputStream().readAllBytes(), params);
            File fileEntity = File.builder().creator(securityService.getUserFromRequest()).size(file.getSize()).fileCloudId(result.get("public_id").toString()).name(file.getOriginalFilename()).type(mimeType).path(result.get("secure_url").toString()).build();
            log.info("Upload file id: {}", fileEntity.getFileCloudId());
            return fileDao.save(fileEntity);
        } catch (IOException exception) {
            log.error("Upload file error: {}", exception.getLocalizedMessage());
            throw new AppException(AppError.FILE_UPLOAD_FAILED);
        }
    }


    private String getMimetype(MultipartFile file) {
        String contentType = file.getContentType();
        if (StringUtils.hasText(contentType)) {
            String type = contentType.split("/")[0];
            if ("image".equalsIgnoreCase(type) || "video".equalsIgnoreCase(type) || "audio".equalsIgnoreCase(type)) {
                return type;
            }
        }
        return "raw";
    }

    @Transactional
    public void delete(Long id) {
        File file = fileDao.findById(id).orElseThrow(() -> new AppException(AppError.FILE_NOT_FOUND));
        if (!file.getCreator().getId().equals(securityService.getUserFromRequest().getId())) {
            throw new AppException(AppError.AUTH_ACCESS_DENIED);
        }
        try {
            storage.api().deleteResources(Collections.singletonList(file.getFileCloudId()), ObjectUtils.asMap("type", "upload", "resource_type", file.getType()));
            fileDao.delete(file);
            log.info("Delete file: {}", file.getFileCloudId());
        } catch (Exception exception) {
            log.error("Delete file error: {}", exception.getLocalizedMessage());
            throw new AppException(AppError.FILE_UPLOAD_FAILED);
        }
    }


}
