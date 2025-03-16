package com.studyapp.be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
public class PostResponseDto {
    private Long id;
    private UserLoginResponseDto.UserInfo creator;
    private String content;
    private Set<FileResponseDto> attachments;
    private Set<ReactionResponseDto> reactions;
    private PostResponseDto sharedPost;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int totalComments;
}
