package com.studyapp.be.controllers;

import com.studyapp.be.Utils;
import com.studyapp.be.dto.response.FriendShipResponseDto;
import com.studyapp.be.services.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/friendships")
public class FriendshipController {
    private final FriendService friendService;

    @GetMapping
    public ResponseEntity<Page<FriendShipResponseDto>> getFriendships(
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {

        PageRequest pageRequest = PageRequest.of(page, size, Utils.parseSort(sort));
        return ResponseEntity.ok(friendService.getFriendships(name, pageRequest));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFriendship(@PathVariable Long id) {
        friendService.deleteFriendship(id);
        return ResponseEntity.ok().build();
    }
}
