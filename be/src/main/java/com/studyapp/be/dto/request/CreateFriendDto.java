package com.studyapp.be.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class CreateFriendDto {
    @NotNull(message = "The user1 must not be null")
    private Long user1Id;

    @NotNull(message = "The user2 must not be null")
    private Long user2Id;
}
