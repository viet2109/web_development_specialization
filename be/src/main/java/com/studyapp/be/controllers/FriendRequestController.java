package com.studyapp.be.controllers;

import com.studyapp.be.Utils;
import com.studyapp.be.dto.response.FriendShipRequestResponseDto;
import com.studyapp.be.services.FriendRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/friend-requests")
@Tag(name = "Friend Request API", description = "APIs for managing friend requests and friendship invitations")
public class FriendRequestController {
    private final FriendRequestService friendRequestService;

    @Operation(
            summary = "Send Friend Request",
            description = "Sends a friend request to a specified receiver using the provided receiver ID."
    )
    @PostMapping
    public ResponseEntity<?> sendFriendRequest(
            @RequestBody @Valid @NotNull(message = "ReceiverId must not be null") Long receiverId) {
        friendRequestService.createFriendRequest(receiverId);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Get Friend Requests",
            description = "Retrieves a paginated list of friend requests with optional sorting parameters."
    )
    @GetMapping
    public ResponseEntity<Page<FriendShipRequestResponseDto>> getFriendRequest(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort
    ) {
        Pageable pageable = PageRequest.of(page, size, Utils.parseSort(sort));
        return ResponseEntity.ok(friendRequestService.getFriendRequest(pageable));
    }

    @Operation(
            summary = "Accept Friend Request",
            description = "Accepts the friend request identified by the provided request ID."
    )
    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptRequest(@PathVariable Long id) {
        friendRequestService.acceptRequest(id);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Delete Friend Request",
            description = "Deletes the friend request specified by the request ID."
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequest(@PathVariable Long id) {
        friendRequestService.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }
}
