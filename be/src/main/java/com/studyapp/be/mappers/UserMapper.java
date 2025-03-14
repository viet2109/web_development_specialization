package com.studyapp.be.mappers;

import com.studyapp.be.dto.request.UserSignUpRequest;
import com.studyapp.be.entities.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User dtoToEntity(UserSignUpRequest dto);
}
