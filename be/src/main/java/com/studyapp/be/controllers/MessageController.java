package com.studyapp.be.controllers;

import com.studyapp.be.Utils;
import com.studyapp.be.dto.request.CreateMessageRequestDto;
import com.studyapp.be.dto.response.MessageResponseDto;
import com.studyapp.be.enums.MessageStatus;
import com.studyapp.be.enums.MessageType;
import com.studyapp.be.services.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDateTime;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/messages")
public class MessageController {
    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

    @GetMapping
    public Page<MessageResponseDto> searchMessages(@RequestParam(required = false) Long senderId, @RequestParam(required = false) Long roomId, @RequestParam(required = false) String keyword, @RequestParam(required = false) MessageStatus status, @RequestParam(required = false) MessageType type, @RequestParam(required = false) Boolean isDeleted, @RequestParam(required = false) LocalDateTime startDate, @RequestParam(required = false) LocalDateTime endDate, @RequestParam(required = false) Boolean isHasFiles, @RequestParam(defaultValue = "true") boolean paged, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, @RequestParam(defaultValue = "createdAt,asc") String[] sort) {
        Sort multiSort = Utils.parseSort(sort);
        Pageable pageable = PageRequest.of(page, size, multiSort);
        return messageService.searchMessages(senderId, roomId, status, type, isDeleted, startDate, endDate, keyword, isHasFiles, pageable, paged);
    }

    @PostMapping()
    public ResponseEntity<MessageResponseDto> sendMessage(@ModelAttribute @Valid CreateMessageRequestDto message) {
        MessageResponseDto messageResponseDto = messageService.createMessage(message);
        messagingTemplate.convertAndSend("/topic/chatRooms/" + message.getRoomId() + "/newMessage", messageResponseDto);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(messageResponseDto.getId()).toUri();
        return ResponseEntity.created(location).body(messageResponseDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        messageService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }
}
