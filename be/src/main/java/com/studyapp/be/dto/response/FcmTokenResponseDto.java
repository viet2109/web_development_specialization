package com.studyapp.be.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
public class FcmTokenResponseDto {
    private String token;
    private UserLoginResponseDto.UserInfo user;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
