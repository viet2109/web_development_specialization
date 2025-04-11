package com.studyapp.be.dto.response;

import lombok.*;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Setter
public class ReactionSummaryDto {
    private String emoji;
    private Long count;
}
