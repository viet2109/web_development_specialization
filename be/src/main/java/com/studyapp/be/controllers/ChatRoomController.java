package com.studyapp.be.controllers;

import com.studyapp.be.Utils;
import com.studyapp.be.dto.request.CreateChatRoomRequest;
import com.studyapp.be.dto.response.ChatRoomResponseDto;
import com.studyapp.be.enums.ChatRoomType;
import com.studyapp.be.services.ChatRoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/chat-rooms")
@RequiredArgsConstructor
@Tag(name = "Chat Room API", description = "APIs for managing chat rooms")
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    @Operation(
            summary = "Create Chat Room",
            description = "Creates a new chat room using the provided details."
    )
    @PostMapping
    public ResponseEntity<ChatRoomResponseDto> createChatRoom(
            @Parameter(description = "Request body containing chat room details", required = true)
            @RequestBody @Valid CreateChatRoomRequest request) {

        ChatRoomResponseDto chatRoom = chatRoomService.createChatRoom(request);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(chatRoom.getId())
                .toUri();
        return ResponseEntity.created(location).body(chatRoom);
    }

    @Operation(
            summary = "Get Chat Room by ID",
            description = "Retrieves the chat room details for the given chat room ID."
    )
    @GetMapping("/{id}")
    public ResponseEntity<ChatRoomResponseDto> findRoomById(
            @Parameter(description = "ID of the chat room", required = true)
            @PathVariable Long id) {

        return ResponseEntity.ok(chatRoomService.findRoomById(id));
    }

    @Operation(
            summary = "Search Chat Rooms",
            description = "Searches for chat rooms using optional filtering criteria such as name, type, creator ID, member ID, and creation date. Supports pagination and sorting."
    )
    @GetMapping
    public Page<ChatRoomResponseDto> searchChatRooms(
            @Parameter(description = "Name of the chat room to search for", required = false)
            @RequestParam(required = false) String name,

            @Parameter(description = "Type of the chat room", required = false)
            @RequestParam(required = false) ChatRoomType type,

            @Parameter(description = "ID of the creator", required = false)
            @RequestParam(required = false) Long creatorId,

            @Parameter(description = "ID of a member in the chat room", required = false)
            @RequestParam(required = false) Long memberId,

            @Parameter(description = "Filter chat rooms created after this date time", required = false)
            @RequestParam(required = false) LocalDateTime createdAfter,

            @Parameter(description = "Page number for pagination (default is 0)", required = false)
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Page size for pagination (default is 10)", required = false)
            @RequestParam(defaultValue = "10") int size,

            @Parameter(description = "Sort criteria in the format property,direction. Default is createdAt,desc", required = false)
            @RequestParam(defaultValue = "createdAt,desc") String[] sort
    ) {
        Sort multiSort = Utils.parseSort(sort);
        Pageable pageable = PageRequest.of(page, size, multiSort);
        return chatRoomService.searchChatRooms(name, type, creatorId, memberId, createdAfter, pageable);
    }
}
