package com.studyapp.be.services;

import com.studyapp.be.dao.FriendDao;
import com.studyapp.be.dao.FriendRequestDao;
import com.studyapp.be.dao.UserDao;
import com.studyapp.be.dto.request.CreateChatRoomRequest;
import com.studyapp.be.dto.response.FriendShipRequestResponseDto;
import com.studyapp.be.entities.FriendShip;
import com.studyapp.be.entities.FriendShipRequest;
import com.studyapp.be.entities.User;
import com.studyapp.be.enums.AppError;
import com.studyapp.be.enums.ChatRoomType;
import com.studyapp.be.exceptions.AppException;
import com.studyapp.be.mappers.FriendShipRequestMapper;
import com.studyapp.be.specifications.FriendShipRequestSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class FriendRequestService {
    private final FriendRequestDao friendRequestDao;
    private final FriendDao friendDao;
    private final FcmService fcmService;
    private final UserDao userDao;
    private final FriendShipRequestMapper friendShipRequestMapper;
    private final SecurityService securityService;
    private final ChatRoomService chatRoomService;

    @Transactional
    public void createFriendRequest(Long receiverId) {
        User sender = securityService.getUserFromRequest();
        User receiver = userDao.findById(receiverId).orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND));
        if ((friendRequestDao.existsBySender(sender) && friendRequestDao.existsByReceiver(receiver)) || (friendRequestDao.existsByReceiver(receiver) && friendRequestDao.existsBySender(sender))) {
            throw new AppException(AppError.FRIEND_REQUEST_ALREADY_EXIST);
        }
        FriendShipRequest friendShipRequest = FriendShipRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .build();
        friendRequestDao.save(friendShipRequest);
        fcmService.sendToUser(receiver.getId(), "New Friend Request", sender.getFirstName() + " has sent you a friend request. Tap to view details.", Map.of("type", "friend_request", "senderId", receiver.getId().toString()));
    }

    @Transactional
    public void acceptRequest(Long id) {
        FriendShipRequest friendShipRequest = friendRequestDao.findById(id).orElseThrow(() -> new AppException(AppError.FRIEND_REQUEST_NOT_FOUND));
        User sender = friendShipRequest.getSender();
        User receiver = friendShipRequest.getReceiver();
        if (!securityService.getUserFromRequest().getId().equals(receiver.getId())) {
            throw new AppException(AppError.AUTH_ACCESS_DENIED);
        }
        FriendShip friendShip = FriendShip.builder()
                .user1(sender)
                .user2(receiver)
                .build();
        friendDao.save(friendShip);
        friendRequestDao.delete(friendShipRequest);
        fcmService.sendToUser(sender.getId(), "Friend Request Accepted", receiver.getFirstName() + " accepted your friend request! Tap to start chatting.", Map.of("type", "friend_request_accepted", "receiverId", receiver.getId().toString()));
        chatRoomService.createChatRoom(CreateChatRoomRequest.builder()
                .memberIds(Set.of(receiver.getId()))
                .chatType(ChatRoomType.PRIVATE)
                .build());
    }

    @Transactional
    public void deleteRequest(Long id) {
        FriendShipRequest friendShipRequest = friendRequestDao.findById(id).orElseThrow(() -> new AppException(AppError.FRIEND_REQUEST_NOT_FOUND));
        if (!securityService.getUserFromRequest().getId().equals(friendShipRequest.getSender().getId()) || securityService.getUserFromRequest().getId().equals(friendShipRequest.getReceiver().getId())) {
            throw new AppException(AppError.AUTH_ACCESS_DENIED);
        }
        friendRequestDao.delete(friendShipRequest);
    }

    public Page<FriendShipRequestResponseDto> getFriendRequestSent(Pageable pageable) {
        Specification<FriendShipRequest> spec = Specification.where(null);
        spec = spec.and(FriendShipRequestSpecification.hasSender(securityService.getUserFromRequest().getId()));
        return friendRequestDao.findAll(spec, pageable).map(friendShipRequestMapper::entityToDto);
    }

    public Page<FriendShipRequestResponseDto> getFriendRequestReceived(Pageable pageable) {
        Specification<FriendShipRequest> spec = Specification.where(null);
        spec = spec.and(FriendShipRequestSpecification.hasReceiver(securityService.getUserFromRequest().getId()));
        return friendRequestDao.findAll(spec, pageable).map(friendShipRequestMapper::entityToDto);
    }
}
