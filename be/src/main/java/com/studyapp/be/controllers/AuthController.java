package com.studyapp.be.controllers;

import com.studyapp.be.dto.request.UserLoginRequestDto;
import com.studyapp.be.dto.request.UserSignUpRequest;
import com.studyapp.be.entities.User;
import com.studyapp.be.services.AuthService;
import com.studyapp.be.services.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;
    private final EmailService emailService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid UserLoginRequestDto userLoginRequestDto) {
        return ResponseEntity.ok(authService.login(userLoginRequestDto));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody @Valid UserSignUpRequest userSignUpRequest) {
        User user = authService.signUp(userSignUpRequest);
        String verificationUrl = "http://localhost:8080/auth/verify?token=" + authService.createVerificationToken(user);
        emailService.sendSimpleMessage(userSignUpRequest.getEmail(), "Verify account",
                "Please click the link to verify account: " + verificationUrl);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(user.getId()).toUri();
        return ResponseEntity.created(location).build();
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmailToken(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.noContent().build();
    }
}
