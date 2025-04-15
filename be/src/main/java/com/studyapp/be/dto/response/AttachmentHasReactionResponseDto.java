package com.studyapp.be.dto.response;

import com.studyapp.be.dto.response.bases.AttachmentResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AttachmentHasReactionResponseDto extends AttachmentResponseDto {
    private List<ReactionSummaryDto> reactionSummary;
}
