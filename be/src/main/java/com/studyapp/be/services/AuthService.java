package com.studyapp.be.services;

import com.studyapp.be.dao.UserDao;
import com.studyapp.be.dao.VerificationEmailTokenDao;
import com.studyapp.be.dto.request.UserLoginRequestDto;
import com.studyapp.be.dto.request.UserSignUpRequest;
import com.studyapp.be.dto.response.UserLoginResponseDto;
import com.studyapp.be.entities.User;
import com.studyapp.be.entities.VerificationEmailToken;
import com.studyapp.be.enums.ActiveStatus;
import com.studyapp.be.enums.AppError;
import com.studyapp.be.enums.UserStatus;
import com.studyapp.be.exceptions.AppException;
import com.studyapp.be.mappers.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserMapper userMapper;
    private final UserDao userDao;
    private final PasswordEncoder passwordEncoder;
    private final VerificationEmailTokenDao verificationEmailTokenDao;
    private final JwtTokenProvider jwtTokenProvider;

    public UserLoginResponseDto login(UserLoginRequestDto userLoginRequestDto) {
        User user = userDao.findByEmail(userLoginRequestDto.getEmail()).orElseThrow(() -> new AppException(AppError.AUTH_TOKEN_INVALID));
        if (!passwordEncoder.matches(userLoginRequestDto.getPassword(), user.getPassword()) || user.getStatus() != UserStatus.ACTIVE) {
            throw new AppException(AppError.AUTH_INVALID_CREDENTIALS);
        }
        user.setActiveStatus(ActiveStatus.ONLINE);
        user.setLastActive(LocalDateTime.now());
        UserLoginResponseDto.UserInfo userInfo = userMapper.entityToDto(user);
        return UserLoginResponseDto.builder().user(userInfo).accessToken(jwtTokenProvider.generateToken(userInfo.getEmail())).build();
    }


    @Transactional
    public UserLoginResponseDto.UserInfo signUp(UserSignUpRequest dto) {
        User existUser = userDao.findByEmail(dto.getEmail()).orElse(null);
        if (existUser != null && existUser.getStatus() != UserStatus.INACTIVE) {
            throw new AppException(AppError.USER_EMAIL_ALREADY_EXISTS);
        } else if (existUser != null) {
            return userMapper.entityToDto(existUser);
        }
        if (StringUtils.hasText(dto.getPhone()) || userDao.existsByPhone(dto.getPhone()))
            throw new AppException(AppError.USER_PHONE_ALREADY_EXISTS);
        dto.setPassword(passwordEncoder.encode(dto.getPassword()));
        User user = userMapper.dtoToEntity(dto);
        return userMapper.entityToDto(userDao.save(user));
    }

    @Transactional
    public String createVerificationToken(Long userId) {
        String token = UUID.randomUUID().toString();
        verificationEmailTokenDao.save(VerificationEmailToken.builder().token(token).user(userDao.findById(userId).orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND))).build());
        return token;
    }

    @Transactional
    public void verifyEmail(String token) {
        verificationEmailTokenDao.findByToken(token).ifPresentOrElse(verificationEmailToken -> {
            if (LocalDateTime.now().isAfter(verificationEmailToken.getExpiryDate())) {
                throw new AppException(AppError.TOKEN_EXPIRED);
            }
            User user = verificationEmailToken.getUser();
            user.setStatus(UserStatus.ACTIVE);
            userDao.save(user);
            verificationEmailTokenDao.deleteAllByUser(user);
        }, () -> {
            throw new AppException(AppError.TOKEN_NOT_FOUND);
        });
    }
}
