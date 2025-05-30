package com.studyapp.be.controllers;

import com.studyapp.be.dto.request.UserLoginRequestDto;
import com.studyapp.be.dto.request.UserSignUpRequest;
import com.studyapp.be.dto.response.UserLoginResponseDto;
import com.studyapp.be.services.AuthService;
import com.studyapp.be.services.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
@Tag(name = "Auth API", description = "APIs for user authentication, account registration, and email verification")
public class AuthController {

    private final AuthService authService;
    private final EmailService emailService;

    @Value("${app.server.url}")
    private String url;

    @Operation(
            summary = "User Login",
            description = "Authenticates a user with the provided credentials and returns a login response (e.g., token, user info)."
    )
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody @Valid UserLoginRequestDto userLoginRequestDto) {
        return ResponseEntity.ok(authService.login(userLoginRequestDto));
    }

    @Operation(
            summary = "User Sign Up",
            description = "Registers a new user, sends an email with a verification link, and returns the created user's information."
    )
    @PostMapping("/signup")
    public ResponseEntity<UserLoginResponseDto.UserInfo> signup(
            @RequestBody @Valid UserSignUpRequest userSignUpRequest) {
        UserLoginResponseDto.UserInfo user = authService.signUp(userSignUpRequest);
        String verificationUrl = url + "/auth/verify?token="
                + authService.createVerificationToken(user.getId());
        emailService.sendSimpleMessage(userSignUpRequest.getEmail(), "Verify account",
                "Please click the link to verify your account: " + verificationUrl);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(user.getId())
                .toUri();
        return ResponseEntity.created(location).body(user);
    }

    @Operation(
            summary = "Verify Email Token",
            description = "Verifies the user's email address using the provided verification token."
    )
    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmailToken(
            @Parameter(description = "Verification token", required = true)
            @RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.noContent().build();
    }
}
