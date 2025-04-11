package com.studyapp.be.dto.response;

import com.studyapp.be.enums.MemberRole;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class ChatRoomMemberResponseDto {
    private Long id;
    private UserLoginResponseDto.UserInfo user;
    private Set<MemberRole> roles;
    private LocalDateTime joinedAt;
    private String nickname;
}
