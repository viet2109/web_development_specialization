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
public class FriendShipRequestResponseDto {
    private Long id;
    private UserLoginResponseDto.UserInfo sender;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
