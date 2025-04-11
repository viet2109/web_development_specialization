package com.studyapp.be.dto.response;

import com.studyapp.be.dto.response.bases.AttachmentResponseDto;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
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
    private Set<AttachmentResponseDto> attachments;
    private List<ReactionSummaryDto> reactionSummary;
    private PostResponseDto sharedPost;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private long totalComments;
}
