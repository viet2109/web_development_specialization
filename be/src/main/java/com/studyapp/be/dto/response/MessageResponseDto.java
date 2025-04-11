package com.studyapp.be.dto.response;

import com.studyapp.be.dto.response.bases.AttachmentResponseDto;
import com.studyapp.be.enums.MessageStatus;
import com.studyapp.be.enums.ReplyTargetType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class MessageResponseDto {
    private Long id;
    private UserLoginResponseDto.UserInfo sender;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String content;
    private Boolean isDeleted;
    private MessageStatus status;
    private Set<ReactionResponseDto> reactions;
    private Object repliedTarget;
    private ReplyTargetType repliedTargetType;
    private List<AttachmentResponseDto> attachments;
}
