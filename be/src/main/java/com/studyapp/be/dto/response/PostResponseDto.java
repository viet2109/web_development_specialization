package com.studyapp.be.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PostResponseDto {
    private Long id;
    private UserLoginResponseDto.UserInfo creator;
    private String content;
    private Set<FileResponseDto> attachments;
    private Long totalReactions;
    private PostResponseDto sharedPost;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private long totalComments;
}
