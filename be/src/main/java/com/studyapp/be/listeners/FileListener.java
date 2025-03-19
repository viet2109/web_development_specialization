package com.studyapp.be.listeners;

import com.studyapp.be.entities.File;
import jakarta.persistence.PreRemove;
import lombok.NonNull;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.ApplicationEventPublisherAware;
import org.springframework.stereotype.Component;

@Component
public class FileListener implements ApplicationEventPublisherAware {

    private static ApplicationEventPublisher publisher;

    @Override
    public void setApplicationEventPublisher(@NonNull ApplicationEventPublisher applicationEventPublisher) {
        publisher = applicationEventPublisher;
    }

    @PreRemove
    public void preRemove(File file) {
        if (publisher != null) {
            publisher.publishEvent(file.getId());
        }
    }
}
