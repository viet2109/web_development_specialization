package com.studyapp.be.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.studyapp.be.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
public class UserProfileResponseDto {
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String avatarUrl;
    private String phoneNumber;
    private LocalDate birthDate;
    private long postCount;
    private long friendsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Gender gender;


    @JsonProperty("isMe")
    private boolean isMe;
    @JsonProperty("isFriend")
    private boolean isFriend;
    @JsonProperty("isfriendSended")
    private boolean isFriendRequestSent;





}
