package com.studyapp.be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
public class ReactionResponseDto {
    private Long id;
    private UserLoginResponseDto.UserInfo creator;
    private String emoji;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
