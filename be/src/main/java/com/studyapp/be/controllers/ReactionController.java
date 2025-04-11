package com.studyapp.be.controllers;

import com.studyapp.be.dto.response.ReactionResponseDto;
import com.studyapp.be.services.ReactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Reactions", description = "APIs for managing reactions")
@RestController
@RequiredArgsConstructor
@RequestMapping("/reactions")
public class ReactionController {

    private final ReactionService reactionService;

    @Operation(summary = "Update Reaction", description = "Update the reaction with the specified ID by providing a new emoji.")
    @PutMapping("/{id}")
    public ResponseEntity<ReactionResponseDto> updateReaction(
            @Parameter(description = "Emoji to update the reaction to", required = true)
            @RequestBody String emoji,
            @Parameter(description = "ID of the reaction to update", required = true)
            @PathVariable Long id) {
        return ResponseEntity.ok(reactionService.updateReaction(id, emoji));
    }

    @Operation(summary = "Delete Reaction", description = "Delete the reaction corresponding to the provided ID.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReaction(
            @Parameter(description = "ID of the reaction to delete", required = true)
            @PathVariable Long id) {
        reactionService.deleteReaction(id);
        return ResponseEntity.noContent().build();
    }
}
