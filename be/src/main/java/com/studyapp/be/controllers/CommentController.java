package com.studyapp.be.controllers;

import com.studyapp.be.dto.response.ReactionResponseDto;
import com.studyapp.be.services.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
@Tag(name = "Comment API", description = "APIs for managing reactions on comments and their attachments")
public class CommentController {
    private final CommentService commentService;

    @Operation(
            summary = "React to a comment",
            description = "Adds a reaction to the specified comment using the provided emoji."
    )
    @PostMapping("/{id}/reactions")
    public ResponseEntity<ReactionResponseDto> createCommentReaction(
            @RequestBody @Valid @NotBlank(message = "Emoji must not be null") String emoji,
            @Parameter(description = "ID of the comment", required = true) @PathVariable Long id
    ) {
        ReactionResponseDto reaction = commentService.createReaction(id, emoji);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(reaction.getId())
                .toUri();
        return ResponseEntity.created(location).body(reaction);
    }

    @Operation(
            summary = "React to a comment attachment",
            description = "Adds a reaction to the attachment of the specified comment using the provided emoji."
    )
    @PostMapping("/{id}/attachment/reactions")
    public ResponseEntity<ReactionResponseDto> createAttachmentReaction(
            @RequestBody @Valid @NotBlank(message = "Emoji must not be null") String emoji,
            @Parameter(description = "ID of the comment", required = true) @PathVariable Long id
    ) {
        ReactionResponseDto reaction = commentService.createAttachmentReaction(id, emoji);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(reaction.getId())
                .toUri();
        return ResponseEntity.created(location).body(reaction);
    }

    @Operation(
            summary = "Delete Comment",
            description = "Deletes a comment based on the provided ID."
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@Parameter(description = "ID of the comment to be deleted", required = true)
                                              @PathVariable Long id) {
        commentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
