package com.studyapp.be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Set;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
public class CommentAttachmentResponseDto {
    private Long id;
    private FileResponseDto file;
    private Set<ReactionResponseDto> reactions;
    private Long totalReactions;
}
