package com.studyapp.be.mappers;

import com.studyapp.be.dto.request.UserSignUpRequest;
import com.studyapp.be.dto.response.UserLoginResponseDto;
import com.studyapp.be.entities.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User dtoToEntity(UserSignUpRequest dto);
    UserLoginResponseDto.UserInfo entityToDto(User user);
}
