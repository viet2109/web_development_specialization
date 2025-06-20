package com.studyapp.be.dto.response;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;




@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
public class UserSearchResponseDto {
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String avatarUrl;
    @JsonProperty("isFriend")
    private boolean isFriend;
    @JsonProperty("isfriendSended")
    private boolean isFriendRequestSent;
}
