package com.studyapp.be.controllers;

import com.studyapp.be.dto.response.ReactionResponseDto;
import com.studyapp.be.services.ReactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/reactions")
@Tag(name = "Reaction API", description = "APIs for updating and managing reactions")
public class ReactionController {

    private final ReactionService reactionService;

    @Operation(
            summary = "Update a reaction",
            description = "Updates the reaction's emoji for the reaction identified by the provided ID."
    )
    @PutMapping("/{id}")
    public ResponseEntity<ReactionResponseDto> updateReaction(
            @Parameter(description = "ID of the reaction to update", required = true)
            @PathVariable Long id,
            @Parameter(description = "New emoji for the reaction", required = true)
            @RequestBody @Valid @NotBlank(message = "The emoji must not be null") String emoji) {
        return ResponseEntity.ok(reactionService.updateReaction(id, emoji));
    }
}
