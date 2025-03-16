package com.studyapp.be.services;

import com.studyapp.be.dao.UserDao;
import com.studyapp.be.dto.response.UserLoginResponseDto;
import com.studyapp.be.enums.AppError;
import com.studyapp.be.exceptions.AppException;
import com.studyapp.be.mappers.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserDao userDao;
    private final UserMapper userMapper;

    public UserLoginResponseDto.UserInfo findUserByEmail(String email) {
        return userMapper.entityToDto(userDao.findByEmail(email).orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND)));
    }
}
