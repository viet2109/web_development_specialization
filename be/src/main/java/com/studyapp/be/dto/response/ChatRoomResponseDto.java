package com.studyapp.be.dto.response;

import lombok.*;

import java.util.Set;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class ChatRoomResponseDto {
    private Long id;
    private String name;
    private UserLoginResponseDto.UserInfo creator;
    private Set<ChatRoomMemberResponseDto> members;
}
