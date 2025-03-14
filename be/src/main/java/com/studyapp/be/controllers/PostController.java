package com.studyapp.be.controllers;

import com.studyapp.be.services.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/posts")
public class PostController {
    private final EmailService emailService;

    @GetMapping
    public ResponseEntity<?> findPostById() {
        emailService.sendSimpleMessage("wearechampion21092003@gmail.com", "Test subject", "Test content");
        return ResponseEntity.ok("post found");
    }
}
