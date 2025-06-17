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
public class FriendShipResponseDto {
    private Long id;
    private UserLoginResponseDto.UserInfo user1;
    private UserLoginResponseDto.UserInfo user2;
    private LocalDateTime createdAt;
}
