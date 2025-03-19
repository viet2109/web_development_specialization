package com.studyapp.be.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CommentResponseDto {
    private Long id;
    private String content;
    private Long totalChildren;
    private Long totalReactions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserLoginResponseDto.UserInfo creator;
    private CommentAttachmentResponseDto attachment;
}
