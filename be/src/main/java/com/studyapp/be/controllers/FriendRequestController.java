package com.studyapp.be.controllers;

import com.studyapp.be.dto.response.FriendShipRequestResponseDto;
import com.studyapp.be.services.FriendRequestService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/friend-requests")
public class FriendRequestController {
    private final FriendRequestService friendRequestService;

    @PostMapping("/send")
    public ResponseEntity<?> sendFriendRequest(@RequestBody @Valid @NotNull(message = "ReceiverId must not be null") Long receiverId) {
        friendRequestService.createFriendRequest(receiverId);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<Page<FriendShipRequestResponseDto>> getFriendRequest(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort
    ) {
        Pageable pageable = PageRequest.of(page, size, parseSort(sort));
        return ResponseEntity.ok(friendRequestService.getFriendRequest(pageable));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptRequest(@PathVariable Long id) {
        friendRequestService.acceptRequest(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequest(@PathVariable Long id) {
        friendRequestService.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }

    private Sort parseSort(String[] sortParams) {
        Sort sort = Sort.unsorted();
        if (!sortParams[0].contains(",")) {
            String field = sortParams[0];
            String direction = sortParams[1].toLowerCase();
            Sort.Order order = direction.equals("desc") ? Sort.Order.desc(field) : Sort.Order.asc(field);
            sort = sort.and(Sort.by(order));
            return sort;
        }
        for (String param : sortParams) {
            String[] fieldAndDirection = param.split(",");
            if (fieldAndDirection.length == 2) {
                String field = fieldAndDirection[0];
                String direction = fieldAndDirection[1].toLowerCase();
                Sort.Order order = direction.equals("desc") ? Sort.Order.desc(field) : Sort.Order.asc(field);
                sort = sort.and(Sort.by(order));
            }
        }
        return sort;
    }
}
