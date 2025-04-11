package com.studyapp.be.controllers;

import com.studyapp.be.Utils;
import com.studyapp.be.dto.request.CreateMessageRequestDto;
import com.studyapp.be.dto.response.MessageResponseDto;
import com.studyapp.be.enums.MessageStatus;
import com.studyapp.be.enums.MessageType;
import com.studyapp.be.services.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Message API", description = "APIs for sending, retrieving, and deleting messages")
public class MessageController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

    @Operation(
            summary = "Search Messages",
            description = "Retrieves a paginated list of messages filtered by various parameters such as sender ID, room ID, status, type, deletion flag, date range, file presence, and keyword."
    )
    @GetMapping
    public Page<MessageResponseDto> searchMessages(
            @Parameter(description = "ID of the message sender", required = false)
            @RequestParam(required = false) Long senderId,

            @Parameter(description = "ID of the chat room", required = false)
            @RequestParam(required = false) Long roomId,

            @Parameter(description = "Keyword to search in message content", required = false)
            @RequestParam(required = false) String keyword,

            @Parameter(description = "Status of the message", required = false)
            @RequestParam(required = false) MessageStatus status,

            @Parameter(description = "Type of the message", required = false)
            @RequestParam(required = false) MessageType type,

            @Parameter(description = "Flag indicating if the message is deleted", required = false)
            @RequestParam(required = false) Boolean isDeleted,

            @Parameter(description = "Filter messages sent after this date/time", required = false)
            @RequestParam(required = false) LocalDateTime startDate,

            @Parameter(description = "Filter messages sent before this date/time", required = false)
            @RequestParam(required = false) LocalDateTime endDate,

            @Parameter(description = "Flag indicating if the message has attached files", required = false)
            @RequestParam(required = false) Boolean isHasFiles,

            @Parameter(description = "Flag to enable pagination, default is true", required = false)
            @RequestParam(defaultValue = "true") boolean paged,

            @Parameter(description = "Page number for pagination (default is 0)", required = false)
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Page size for pagination (default is 10)", required = false)
            @RequestParam(defaultValue = "10") int size,

            @Parameter(description = "Sort criteria in the format property,direction (default is createdAt,asc)", required = false)
            @RequestParam(defaultValue = "createdAt,asc") String[] sort
    ) {
        Sort multiSort = Utils.parseSort(sort);
        Pageable pageable = PageRequest.of(page, size, multiSort);
        return messageService.searchMessages(senderId, roomId, status, type, isDeleted, startDate, endDate, keyword, isHasFiles, pageable, paged);
    }

    @Operation(
            summary = "Send Message",
            description = "Creates a new message with the provided details and sends a notification to subscribers via WebSocket."
    )
    @PostMapping
    public ResponseEntity<MessageResponseDto> sendMessage(
            @Parameter(description = "Message details", required = true)
            @ModelAttribute @Valid CreateMessageRequestDto message
    ) {
        MessageResponseDto messageResponseDto = messageService.createMessage(message);
        // Notify subscribers about the new message in the given chat room.
        messagingTemplate.convertAndSend("/topic/chatRooms/" + message.getRoomId() + "/newMessage", messageResponseDto);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(messageResponseDto.getId())
                .toUri();
        return ResponseEntity.created(location).body(messageResponseDto);
    }

    @Operation(
            summary = "Delete Message",
            description = "Deletes a message identified by the provided message ID."
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(
            @Parameter(description = "ID of the message to be deleted", required = true)
            @PathVariable Long id
    ) {
        messageService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }
}
