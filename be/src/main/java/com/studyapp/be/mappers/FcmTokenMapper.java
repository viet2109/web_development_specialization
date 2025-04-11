package com.studyapp.be.mappers;

import com.studyapp.be.dto.response.FcmTokenResponseDto;
import com.studyapp.be.entities.UserFcmToken;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FcmTokenMapper {
    FcmTokenResponseDto entityToDto(UserFcmToken entity);
}
