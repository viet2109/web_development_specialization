package com.studyapp.be.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CommentResponseDto {
    private Long id;
    private String content;
    private Long parentId;
    private Long totalChildren;
    private List<ReactionSummaryDto> reactionSummary;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserLoginResponseDto.UserInfo creator;
    private AttachmentHasReactionResponseDto attachment;
    private boolean hasReacted;
    private String userReactionEmoji;
    private Long userReactionId;
}
