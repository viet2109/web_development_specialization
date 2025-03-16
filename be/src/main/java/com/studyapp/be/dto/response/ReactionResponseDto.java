package com.studyapp.be.dto.response;

import com.studyapp.be.enums.ReactionType;
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
    private UserLoginResponseDto.UserInfo user;
    private String emoji;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
