package com.studyapp.be.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CreateReactionRequestDto {
    @NotNull(message = "The userId must not be null")
    private Long userId;

    @NotBlank(message = "The emoji must not be null")
    private String emoji;
}
