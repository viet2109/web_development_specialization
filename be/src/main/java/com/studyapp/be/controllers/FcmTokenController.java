package com.studyapp.be.controllers;

import com.studyapp.be.services.FcmService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/fcm-tokens")
@RequiredArgsConstructor
@Tag(name = "FCM Token API", description = "APIs for managing FCM tokens used for push notifications")
public class FcmTokenController {
    private final FcmService fcmService;

    @Operation(
            summary = "Register FCM Token for Current User",
            description = "Subscribes the given FCM token to the current authenticated user's personal topic so they can receive user-specific notifications."
    )
    @PostMapping
    public ResponseEntity<Void> createFcmToken(@RequestBody String token) {
        fcmService.createFcmToken(token);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{token}")
                .buildAndExpand(token)
                .toUri();
        return ResponseEntity.created(location).build();
    }

    @Operation(
            summary = "Register FCM Token for Global Broadcast",
            description = "Subscribes the given FCM token to the global \"all_users\" topic so that the device will receive broadcast notifications sent to all users."
    )
    @PostMapping("/all")
    public ResponseEntity<Void> createFcmTokenForAllUsers(@RequestBody String token) {
        fcmService.createFcmTokenForAllUser(token);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{token}")
                .buildAndExpand(token)
                .toUri();
        return ResponseEntity.created(location).build();
    }

    @Operation(summary = "Delete FCM Token", description = "Deletes the FCM token specified by the token string.")
    @DeleteMapping("/{token}")
    public ResponseEntity<Void> deleteFcmToken(@PathVariable String token) {
        fcmService.deleteFcmToken(token);
        return ResponseEntity.noContent().build();
    }
}
