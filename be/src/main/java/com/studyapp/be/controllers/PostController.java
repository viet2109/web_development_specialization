package com.studyapp.be.controllers;

import com.studyapp.be.Utils;
import com.studyapp.be.dto.request.CreateCommentRequestDto;
import com.studyapp.be.dto.request.CreatePostRequestDto;
import com.studyapp.be.dto.response.CommentResponseDto;
import com.studyapp.be.dto.response.PostResponseDto;
import com.studyapp.be.dto.response.ReactionResponseDto;
import com.studyapp.be.services.PostCommentService;
import com.studyapp.be.services.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/posts")
@Tag(
        name = "Post API",
        description = "APIs for managing posts, including operations for handling post content, managing post comments, and processing reactions on posts, comments, and comment attachments."
)
public class PostController {
    private final PostService postService;
    private final PostCommentService commentService;

    @Operation(
            summary = "Create a new post",
            description = "Creates a new post with the provided data and returns the created post."
    )
    @PostMapping
    public ResponseEntity<PostResponseDto> createPost(
            @ModelAttribute @Valid CreatePostRequestDto createPostRequestDto) {
        PostResponseDto post = postService.createPost(createPostRequestDto);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(post.getId())
                .toUri();
        return ResponseEntity.created(location).body(post);
    }

    @Operation(
            summary = "Get feed",
            description = "Retrieves a paginated list of posts for the feed, supporting sorting."
    )
    @GetMapping("/feed")
    public ResponseEntity<Page<PostResponseDto>> getFeed(
            @Parameter(description = "Page number", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of posts per page", example = "10") @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.getRankedPosts(page, size));
    }

    @Operation(
            summary = "Delete a post",
            description = "Deletes the post with the specified ID."
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @Parameter(description = "ID of the post to delete", required = true) @PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "React to a post",
            description = "Adds a reaction to the post using the provided emoji."
    )
    @PostMapping("/{id}/reactions")
    public ResponseEntity<ReactionResponseDto> createPostReaction(
            @RequestBody @Valid @NotBlank(message = "Emoji must not be null") String emoji,
            @Parameter(description = "ID of the post", required = true, in = ParameterIn.PATH) @PathVariable Long id) {
        ReactionResponseDto reaction = postService.createReaction(id, emoji);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(reaction.getId())
                .toUri();
        return ResponseEntity.created(location).body(reaction);
    }

    @Operation(
            summary = "Create a comment on a post",
            description = "Creates a new comment on the specified post using the provided data."
    )
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponseDto> createComment(
            @ModelAttribute @Valid CreateCommentRequestDto dto,
            @Parameter(description = "ID of the post", required = true) @PathVariable(name = "id") Long postId) {
        CommentResponseDto commentResponseDto = commentService.createComment(postId, dto);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(commentResponseDto.getId())
                .toUri();
        return ResponseEntity.created(location).body(commentResponseDto);
    }

    @Operation(
            summary = "Get comments for a post",
            description = "Retrieves a paginated list of comments for the specified post. Optionally, filter by parent comment to retrieve root comments."
    )
    @GetMapping("/{id}/comments")
    public ResponseEntity<Page<CommentResponseDto>> getComments(
            @Parameter(description = "ID of the parent comment (optional) to filter root comments") @RequestParam(required = false) Long parentId,
            @Parameter(description = "Page number", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of comments per page", example = "10") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort order, e.g., createdAt,desc") @RequestParam(defaultValue = "createdAt,desc") String[] sort,
            @Parameter(description = "ID of the post", required = true) @PathVariable(name = "id") Long postId) {
        Pageable pageable = PageRequest.of(page, size, Utils.parseSort(sort));
        return ResponseEntity.ok(commentService.getComments(parentId, postId, pageable));
    }
}
