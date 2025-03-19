package com.studyapp.be.listeners;

import com.studyapp.be.services.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FilePreRemoveEventListener {

    private final FileService fileService;
    
    @EventListener
    public void handleFilePreRemoveEvent(Long fileId) {
        fileService.delete(fileId);
    }
}

