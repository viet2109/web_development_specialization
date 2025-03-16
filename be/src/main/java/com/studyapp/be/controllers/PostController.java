package com.studyapp.be.controllers;

import com.studyapp.be.dto.request.CreatePostRequestDto;
import com.studyapp.be.dto.response.PostResponseDto;
import com.studyapp.be.dto.response.ReactionResponseDto;
import com.studyapp.be.services.PostService;
import com.studyapp.be.services.ReactionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/posts")
public class PostController {
    private final PostService postService;
    private final ReactionService reactionService;

    @PostMapping
    public ResponseEntity<PostResponseDto> createPost(@ModelAttribute @Valid CreatePostRequestDto createPostRequestDto) {
        PostResponseDto post = postService.createPost(createPostRequestDto);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(post.getId()).toUri();
        return ResponseEntity.created(location).body(post);
    }

    @GetMapping("/feed")
    public ResponseEntity<Page<PostResponseDto>> getFeed(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, HttpServletRequest request) {
        return ResponseEntity.ok(postService.getRankedPosts(page, size));
    }

    @PostMapping("/{id}/reactions")
    public ResponseEntity<ReactionResponseDto> createReaction(@RequestBody @Valid @NotBlank(message = "The emoji must not be null") String emoji, @PathVariable Long id, HttpServletRequest request) {
        ReactionResponseDto reaction = postService.createReaction(id, emoji);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(reaction.getId()).toUri();
        return ResponseEntity.created(location).body(reaction);
    }

    @PutMapping("/{id}/reactions/{reactionId}")
    public ResponseEntity<ReactionResponseDto> updateReaction(@PathVariable Long reactionId, @RequestBody @Valid @NotBlank(message = "The emoji must not be null") String emoji) {
        return ResponseEntity.ok(reactionService.updateReaction(reactionId, emoji));
    }

    @DeleteMapping("/{id}/reactions/{reactionId}")
    public ResponseEntity<Void> deleteReaction(@PathVariable Long reactionId, @PathVariable Long id) {
        postService.deleteReaction(id, reactionId);
        return ResponseEntity.noContent().build();
    }
}
