package com.studyapp.be.dto.request;

import lombok.*;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class UpdateAvatarRequestDto {
    private Long avatarFileId;

}
