package com.studyapp.be.controllers;

import com.studyapp.be.dto.response.FcmTokenResponseDto;
import com.studyapp.be.services.FcmService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/fcm-token")
@RequiredArgsConstructor
@Tag(name = "FCM Token API", description = "APIs for managing FCM tokens used for push notifications")
public class FcmTokenController {
    private final FcmService fcmService;

    @Operation(
            summary = "Create FCM Token",
            description = "Creates a new FCM token using the provided token string and returns the created token details."
    )
    @PostMapping
    public ResponseEntity<FcmTokenResponseDto> createFcmToken(
            @RequestBody @Valid @NotBlank(message = "Token must not be blank") String token) {
        FcmTokenResponseDto responseDto = fcmService.createFcmToken(token);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{token}")
                .buildAndExpand(responseDto.getToken())
                .toUri();
        return ResponseEntity.created(location).body(responseDto);
    }

    @Operation(
            summary = "Delete FCM Token",
            description = "Deletes the FCM token specified by the token string."
    )
    @DeleteMapping("/{token}")
    public ResponseEntity<Void> deleteFcmToken(@PathVariable String token) {
        fcmService.deleteFcmToken(token);
        return ResponseEntity.noContent().build();
    }
}
