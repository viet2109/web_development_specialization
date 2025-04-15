package com.studyapp.be.services;

import com.studyapp.be.dao.FriendDao;
import com.studyapp.be.dao.UserDao;
import com.studyapp.be.dto.request.CreateFriendDto;
import com.studyapp.be.entities.FriendShip;
import com.studyapp.be.entities.User;
import com.studyapp.be.enums.AppError;
import com.studyapp.be.exceptions.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FriendService {
    private final FriendDao friendDao;
    private final UserDao userDao;

    @Transactional
    public void createFriendship(CreateFriendDto dto) {
        User user1 = userDao.findById(dto.getUser1Id()).orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND));
        User user2 = userDao.findById(dto.getUser2Id()).orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND));
        FriendShip friendShip = FriendShip.builder()
                .user1(user1)
                .user2(user2)
                .build();
        friendDao.save(friendShip);
    }

    @Transactional
    public void deleteFriendship(Long id) {
        friendDao.delete(friendDao.findById(id).orElseThrow(() -> new AppException(AppError.FRIENDSHIP_NOT_FOUND)));
    }
}
