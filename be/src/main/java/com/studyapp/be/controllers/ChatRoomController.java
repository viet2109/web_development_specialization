package com.studyapp.be.controllers;

import com.studyapp.be.Utils;
import com.studyapp.be.dto.request.CreateChatRoomRequest;
import com.studyapp.be.dto.response.ChatRoomResponseDto;
import com.studyapp.be.enums.ChatRoomType;
import com.studyapp.be.services.ChatRoomService;
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
public class ChatRoomController {
    private final ChatRoomService chatRoomService;

    @PostMapping
    public ResponseEntity<ChatRoomResponseDto> createChatRoom(@RequestBody @Valid CreateChatRoomRequest request) {
        ChatRoomResponseDto chatRoom = chatRoomService.createChatRoom(request);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(chatRoom.getId())
                .toUri();
        return ResponseEntity.created(location).body(chatRoom);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChatRoomResponseDto> findRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(chatRoomService.findRoomById(id));
    }

    @GetMapping
    public Page<ChatRoomResponseDto> searchChatRooms(@RequestParam(required = false) String name,
                                                     @RequestParam(required = false) ChatRoomType type,
                                                     @RequestParam(required = false) Long creatorId,
                                                     @RequestParam(required = false) Long memberId,
                                                     @RequestParam(required = false) LocalDateTime createdAfter,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "10") int size,
                                                     @RequestParam(defaultValue = "createdAt,desc") String[] sort
    ) {
        Sort multiSort = Utils.parseSort(sort);

        Pageable pageable = PageRequest.of(page, size, multiSort);

        return chatRoomService.searchChatRooms(name, type, creatorId, memberId, createdAfter, pageable);
    }
}
