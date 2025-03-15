package com.studyapp.be.dto.response;

import com.studyapp.be.entities.File;
import com.studyapp.be.entities.User;
import com.studyapp.be.enums.ActiveStatus;
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
public class UserLoginResponseDto {
    private UserInfo user;
    private String accessToken;

    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Getter
    public static class UserInfo {
        private Long id;
        private String email;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime lastActive;
        private ActiveStatus activeStatus;
        private String firstName;
        private String lastName;
        private Gender gender;
        private String phone;
        private LocalDate birthDate;
        private String bio;
        private File avatar;
    }
}
