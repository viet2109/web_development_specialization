package com.studyapp.be.services;

import com.studyapp.be.dao.ChatRoomDao;
import com.studyapp.be.dao.MessageAttachmentDao;
import com.studyapp.be.dao.MessageDao;
import com.studyapp.be.dto.request.CreateMessageRequestDto;
import com.studyapp.be.dto.response.MessageResponseDto;
import com.studyapp.be.entities.File;
import com.studyapp.be.entities.Message;
import com.studyapp.be.entities.MessageAttachment;
import com.studyapp.be.entities.User;
import com.studyapp.be.enums.AppError;
import com.studyapp.be.enums.MessageStatus;
import com.studyapp.be.enums.MessageType;
import com.studyapp.be.enums.ReplyTargetType;
import com.studyapp.be.exceptions.AppException;
import com.studyapp.be.mappers.MessageMapper;
import com.studyapp.be.specifications.MessageSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageDao messageDao;
    private final MessageMapper messageMapper;
    private final ChatRoomDao chatRoomDao;
    private final FileService fileService;
    private final SecurityService securityService;
    private final MessageAttachmentDao messageAttachmentDao;

    @Transactional
    public MessageResponseDto createMessage(CreateMessageRequestDto messageRequestDto) {
        Message repliedMessage = null;
        MessageAttachment repliedMessageAttachment = null;
        if (messageRequestDto.getRepliedTargetType() != null && messageRequestDto.getRepliedTargetId() != null) {
            switch (messageRequestDto.getRepliedTargetType()) {
                case MESSAGE: {
                    repliedMessage = messageDao.findById(messageRequestDto.getRepliedTargetId()).orElseThrow(() -> new AppException(AppError.MESSAGE_NOT_FOUND));
                    break;
                }
                case ATTACHMENT: {
                    repliedMessageAttachment = messageAttachmentDao.findById(messageRequestDto.getRepliedTargetId()).orElseThrow(() -> new AppException(AppError.FILE_NOT_FOUND));
                    break;
                }
            }
        }

        Message message = messageMapper.dtoToEntity(messageRequestDto);

        List<File> uploadedFiles = null;
        if (messageRequestDto.getMultipartFiles() != null) {
            List<CompletableFuture<File>> futures = messageRequestDto.getMultipartFiles().stream()
                    .filter(Objects::nonNull)
                    .map(file -> CompletableFuture.supplyAsync(() -> {
                        try {
                            return fileService.upload(
                                    file
                            );
                        } catch (Exception e) {
                            log.error("Lỗi upload file", e);
                            return null;
                        }
                    }))
                    .toList();

            uploadedFiles = futures.stream()
                    .map(CompletableFuture::join)
                    .filter(Objects::nonNull)
                    .toList();
        }
        User sender = securityService.getUserFromRequest();
        message.setSender(sender);
        message.setStatus(MessageStatus.SENT);
        message.setRoom(chatRoomDao.findById(messageRequestDto.getRoomId()).orElseThrow(() -> new AppException(AppError.CHATROOM_NOT_FOUND)));

        if ((message.getRepliedTargetId() != null && message.getRepliedTargetType() == null) || (message.getRepliedTargetId() == null && message.getRepliedTargetType() != null)) {
            throw new IllegalArgumentException("RepliedTargetId & RepliedTargetType must be both together");
        }

        if (uploadedFiles != null) {
            List<MessageAttachment> attachments = uploadedFiles.stream().map(file -> {
                MessageAttachment attachment = new MessageAttachment();
                attachment.setFile(file);
                return attachment;
            }).toList();
            message.setAttachments(attachments);
        }
        Message message1 = messageDao.save(message);
        MessageResponseDto messageResponseDto = messageMapper.entityToDto(message1);
        if (messageResponseDto.getRepliedTargetType() != null) {
            switch (messageResponseDto.getRepliedTargetType()) {
                case MESSAGE: {
                    messageResponseDto.setRepliedTarget(repliedMessage);
                    break;
                }
                case ATTACHMENT:
                    messageResponseDto.setRepliedTarget(repliedMessageAttachment);
            }
        }
        return messageResponseDto;
    }


    @Transactional
    public void deleteMessage(Long id) {
        Message message = messageDao.findById(id).orElseThrow(() -> new AppException(AppError.MESSAGE_NOT_FOUND));
        messageDao.delete(message);
    }

    @Transactional
    public void softDeleteMessage(Long id) {
        Message message = messageDao.findById(id).orElseThrow(() -> new AppException(AppError.MESSAGE_NOT_FOUND));
        message.setIsDeleted(true);
        messageDao.save(message);
    }

    public Page<MessageResponseDto> searchMessages(
            Long senderId, Long roomId, MessageStatus status, MessageType type,
            Boolean isDeleted, LocalDateTime startDate, LocalDateTime endDate, String keyword, Boolean isHasFiles,
            Pageable pageable, boolean paged) {

        Specification<Message> spec = MessageSpecification.combineAll(
                senderId, roomId, status, type, isDeleted, startDate, endDate, keyword, isHasFiles
        );

        Page<Message> messages = messageDao.findAll(spec, paged ? pageable : Pageable.unpaged());
        List<Message> messageList = messages.getContent();

        List<Long> repliedMessageIds = messageList.stream()
                .filter(m -> m.getRepliedTargetType() != null && m.getRepliedTargetType() == ReplyTargetType.MESSAGE)
                .map(Message::getRepliedTargetId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        List<Long> repliedAttachmentIds = messageList.stream()
                .filter(m -> m.getRepliedTargetType() != null && m.getRepliedTargetType() == ReplyTargetType.ATTACHMENT)
                .map(Message::getRepliedTargetId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, Message> repliedMessages = repliedMessageIds.isEmpty() ? Collections.emptyMap() :
                StreamSupport.stream(messageDao.findAllById(repliedMessageIds).spliterator(), false)
                        .collect(Collectors.toMap(Message::getId, Function.identity()));

        Map<Long, MessageAttachment> repliedAttachments = repliedAttachmentIds.isEmpty() ? Collections.emptyMap() :
                StreamSupport.stream(messageAttachmentDao.findAllById(repliedAttachmentIds).spliterator(), false)
                        .collect(Collectors.toMap(MessageAttachment::getId, Function.identity()));

        List<MessageResponseDto> dtos = messageList.stream().map(message -> {
            MessageResponseDto dto = messageMapper.entityToDto(message);
            if (dto.getRepliedTargetType() != null) {
                switch (dto.getRepliedTargetType()) {
                    case MESSAGE: {
                        Message repliedMessage = repliedMessages.get(message.getRepliedTargetId());
                        if (repliedMessage == null) {
                            throw new AppException(AppError.MESSAGE_NOT_FOUND);
                        }
                        dto.setRepliedTarget(repliedMessage);
                        break;
                    }
                    case ATTACHMENT: {
                        MessageAttachment repliedAttachment = repliedAttachments.get(message.getRepliedTargetId());
                        if (repliedAttachment == null) {
                            throw new AppException(AppError.FILE_NOT_FOUND);
                        }
                        dto.setRepliedTarget(repliedAttachment);
                        break;
                    }
                }
            }
            return dto;
        }).collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, messages.getTotalElements());
    }
}
