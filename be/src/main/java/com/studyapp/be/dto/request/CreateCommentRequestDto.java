package com.studyapp.be.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CreateCommentRequestDto {
    private String content;
    private Long parentId;

    private MultipartFile attachmentFile;

    @AssertTrue
    public boolean onCreateComment() {
        return StringUtils.hasText(content) || (attachmentFile != null);
    }
}
