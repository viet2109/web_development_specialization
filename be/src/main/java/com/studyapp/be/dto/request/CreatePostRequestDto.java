package com.studyapp.be.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CreatePostRequestDto {
    @NotNull(message = "The userId must not be null")
    private Long userId;

    @NotBlank(message = "The content must not be null")
    private String content;
    private Set<MultipartFile> files;
    private Long sharedPostId;
}
