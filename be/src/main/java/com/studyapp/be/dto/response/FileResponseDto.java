package com.studyapp.be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class FileResponseDto {
    private Long id;
    private String name;
    private String path;
    private String type;
    private Long size;
    private UserLoginResponseDto.UserInfo creator;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
