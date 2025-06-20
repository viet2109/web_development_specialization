package com.studyapp.be.controllers;

import com.studyapp.be.dto.request.UpdateAvatarRequestDto;
import com.studyapp.be.dto.request.UpdateUserRequestDto;
import com.studyapp.be.dto.response.UserLoginResponseDto;
import com.studyapp.be.dto.response.UserProfileResponseDto;
import com.studyapp.be.entities.User;
import com.studyapp.be.services.PostService;
import com.studyapp.be.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/profile")
public class UserController {
    private final UserService userService;

    @PutMapping("/update")
    public UserLoginResponseDto.UserInfo updateUserInfo(
         @Valid @RequestBody UpdateUserRequestDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return userService.updateUserInfo(dto, userDetails.getUsername());
    }
    @PutMapping("/avatar")
    public UserLoginResponseDto.UserInfo updateAvatar(
            @RequestBody UpdateAvatarRequestDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return userService.updateAvatar(dto.getAvatarFileId(), userDetails.getUsername());
    }

    @GetMapping
    public ResponseEntity<UserProfileResponseDto> getMyProfile() {
        return ResponseEntity.ok(userService.getUserProfile(null));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileResponseDto> getOtherProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserProfile(userId));
    }
    @GetMapping("/search")
    public List<User> searchUsers(@RequestParam String q) {
        return userService.searchUsers(q);
    }

}
