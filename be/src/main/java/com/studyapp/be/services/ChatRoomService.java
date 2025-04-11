package com.studyapp.be.services;

import com.studyapp.be.dao.ChatRoomDao;
import com.studyapp.be.dao.UserDao;
import com.studyapp.be.dto.request.CreateChatRoomRequest;
import com.studyapp.be.dto.response.ChatRoomResponseDto;
import com.studyapp.be.entities.ChatRoom;
import com.studyapp.be.entities.ChatRoomMember;
import com.studyapp.be.entities.User;
import com.studyapp.be.enums.AppError;
import com.studyapp.be.enums.ChatRoomType;
import com.studyapp.be.enums.MemberRole;
import com.studyapp.be.exceptions.AppException;
import com.studyapp.be.mappers.ChatRoomMapper;
import com.studyapp.be.specifications.ChatRoomSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatRoomService {
    private final ChatRoomDao chatRoomDao;
    private final UserDao userDao;
    private final ChatRoomMapper chatRoomMapper;
    private final SecurityService securityService;

    @Transactional
    public ChatRoomResponseDto createChatRoom(CreateChatRoomRequest request) {
        User creator = securityService.getUserFromRequest();
        request.getMemberIds().add(creator.getId());

        //cloud chatroom
        if (request.getMemberIds().size() == 1 && chatRoomDao.existsCloudChatRoom(creator)) {
            throw new AppException(AppError.CHATROOM_ALREADY_EXISTS);
        }

        ChatRoom chatRoom = ChatRoom.builder().type(request.getChatType()).name(request.getName()).creator(creator).build();

        Set<ChatRoomMember> members = request.getMemberIds().stream().map(userId -> {
            User memberUser = userDao.findById(userId).orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND));
            Set<MemberRole> roles = new HashSet<>(Collections.singleton(MemberRole.MEMBER));
            if (userId.equals(creator.getId())) roles.add(MemberRole.ADMIN);
            return ChatRoomMember.builder().chatRoom(chatRoom).user(memberUser).roles(roles).build();
        }).collect(Collectors.toSet());

        chatRoom.setMembers(members);
        ChatRoom savedRoom = chatRoomDao.save(chatRoom);
        return chatRoomMapper.entityToDto(savedRoom);
    }

    public ChatRoomResponseDto findRoomById(Long id) {
        return chatRoomMapper.entityToDto(chatRoomDao.findById(id).orElseThrow(() -> new AppException(AppError.CHATROOM_NOT_FOUND)));
    }

    public Page<ChatRoomResponseDto> searchChatRooms(String name,
                                                     ChatRoomType type,
                                                     Long creatorId,
                                                     Long memberId,
                                                     LocalDateTime createdAfter, Pageable pageable) {
        Specification<ChatRoom> spec = ChatRoomSpecification.combineAll(name, type, creatorId, memberId, createdAfter);
        return chatRoomDao.findAll(spec, pageable).map(chatRoomMapper::entityToDto);
    }

}