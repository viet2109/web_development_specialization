package com.studyapp.be.dto.request;

import com.studyapp.be.enums.ReplyTargetType;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
public class CreateMessageRequestDto {
    @NotNull(message = "The roomId must not be null")
    private Long roomId;

    private String content;
    private Long repliedTargetId;
    private ReplyTargetType repliedTargetType;
    private List<MultipartFile> multipartFiles;

    @AssertTrue(message = "The content must not be blank or at least one file size must be greater than 0")
    private boolean isContentOrFilesProvided() {
        return (content != null && !content.isEmpty()) || (multipartFiles != null && !multipartFiles.isEmpty());
    }
}


