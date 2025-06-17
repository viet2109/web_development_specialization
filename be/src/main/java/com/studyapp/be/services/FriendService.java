package com.studyapp.be.services;

import com.studyapp.be.dao.FriendDao;
import com.studyapp.be.dao.UserDao;
import com.studyapp.be.dto.request.CreateFriendDto;
import com.studyapp.be.dto.response.FriendShipResponseDto;
import com.studyapp.be.entities.FriendShip;
import com.studyapp.be.entities.User;
import com.studyapp.be.enums.AppError;
import com.studyapp.be.exceptions.AppException;
import com.studyapp.be.mappers.FriendShipMapper;
import com.studyapp.be.specifications.FriendShipSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class FriendService {
    private final FriendDao friendDao;
    private final UserDao userDao;
    private final SecurityService securityService;
    private final FriendShipMapper friendShipMapper;

    @Transactional
    public FriendShipResponseDto createFriendship(CreateFriendDto dto) {
        User user1 = userDao.findById(dto.getUser1Id()).orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND));
        User user2 = userDao.findById(dto.getUser2Id()).orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND));
        FriendShip friendShip = FriendShip.builder()
                .user1(user1)
                .user2(user2)
                .build();
        return friendShipMapper.entityToDto(friendDao.save(friendShip));
    }

    @Transactional(readOnly = true)
    public Page<FriendShipResponseDto> getFriendships(String userName, Pageable pageable) {
        Specification<FriendShip> spec = Specification.where(null);
        User user = securityService.getUserFromRequest();
        if (user == null) {
            throw new AppException(AppError.USER_NOT_FOUND);
        }
        spec = spec.and(FriendShipSpecification.hasUser(user.getId()));
        if (StringUtils.hasText(userName)) {
            spec = spec.and(FriendShipSpecification.hasNameLike(userName));
        }
        return friendDao.findAll(spec, pageable).map(friendShipMapper::entityToDto);
    }


    @Transactional
    public void deleteFriendship(Long id) {
        friendDao.delete(friendDao.findById(id).orElseThrow(() -> new AppException(AppError.FRIENDSHIP_NOT_FOUND)));
    }
}
