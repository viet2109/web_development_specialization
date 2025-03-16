package com.studyapp.be.controllers;

import com.studyapp.be.dto.request.CreatePostRequestDto;
import com.studyapp.be.dto.response.PostResponseDto;
import com.studyapp.be.services.JwtTokenProvider;
import com.studyapp.be.services.PostService;
import com.studyapp.be.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequiredArgsConstructor
@RequestMapping("/posts")
public class PostController {
    private final PostService postService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<PostResponseDto> createPost(@ModelAttribute @Valid CreatePostRequestDto createPostRequestDto) {
        PostResponseDto post = postService.createPost(createPostRequestDto);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(post.getId()).toUri();
        return ResponseEntity.created(location).body(post);
    }

    @GetMapping("/feed")
    public ResponseEntity<Page<PostResponseDto>> getFeed(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, HttpServletRequest request) {
        Long userId = userService.findUserByEmail(jwtTokenProvider.extractEmail(extractJwtFromRequest(request))).getId();
        return ResponseEntity.ok(postService.getRankedPosts(userId, page, size));
    }

    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
