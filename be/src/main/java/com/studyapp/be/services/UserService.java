package com.studyapp.be.services;

import com.studyapp.be.dao.PostDao;
import com.studyapp.be.dao.UserDao;
import com.studyapp.be.dto.request.UpdateUserRequestDto;
import com.studyapp.be.dto.response.UserLoginResponseDto;
import com.studyapp.be.dto.response.UserProfileResponseDto;
import com.studyapp.be.entities.File;
import com.studyapp.be.entities.User;
import com.studyapp.be.enums.AppError;
import com.studyapp.be.exceptions.AppException;
import com.studyapp.be.mappers.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserDao userDao;
    private final UserMapper userMapper;
    private final FileService fileService;
    private final SecurityService securityService;
    private final PostDao postDao;
    private final FriendService friendService;
    private  final FriendRequestService friendRequestService;
    public UserLoginResponseDto.UserInfo findUserByEmail(String email) {
        return userMapper.entityToDto(userDao.findByEmail(email).orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND)));
    }

    @Transactional
    public UserLoginResponseDto.UserInfo updateUserInfo(UpdateUserRequestDto dto, String email) {
        User user = userDao.findByEmail(email)
                .orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND));

        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getBirthDate() != null) user.setBirthDate(dto.getBirthDate());

        return userMapper.entityToDto(userDao.save(user));
    }
    @Transactional
    public UserLoginResponseDto.UserInfo updateAvatar(Long avatarFileId, String email) {
        User user = userDao.findByEmail(email)
                .orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND));

        File newAvatar = fileService.getFileById(avatarFileId);



        user.setAvatar(newAvatar);
        return userMapper.entityToDto(userDao.save(user));
    }
    public UserProfileResponseDto getUserProfile(Long userId) {
        User currentUser = securityService.getUserFromRequest();

        User targetUser;
        boolean isMe = false;
        boolean isFriend = false;
        boolean isFriendRequestSent = false;

        if (userId == null || currentUser.getId().equals(userId)) {
            targetUser = currentUser;
            isMe = true;
        } else {
            targetUser = userDao.findById(userId)
                    .orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND));
            isFriend = friendService.areFriends(currentUser.getId(), targetUser.getId());
            isFriendRequestSent = friendRequestService.isFriendRequestSent(currentUser.getId(), targetUser.getId());
        }

        long postCount = postDao.countByCreator(targetUser);
        String avatarPath = targetUser.getAvatar() != null ? targetUser.getAvatar().getPath() : null;
        long friendCount = friendService.countFriends();

        return new UserProfileResponseDto(
                targetUser.getId(),
                targetUser.getFirstName(),
                targetUser.getLastName(),
                targetUser.getEmail(),
                avatarPath,
                targetUser.getPhone(),
                targetUser.getBirthDate(),
                postCount,
                friendCount,
                targetUser.getCreatedAt(),
                targetUser.getUpdatedAt(),
                targetUser.getGender(),
                isMe,
                isFriend,
                isFriendRequestSent
        );
    }

    public List<User> searchUsers(String keyword) {
        return userDao.searchByFullName(keyword);
    }





}
