package com.studyapp.be.controllers;

import com.studyapp.be.dto.response.LinkPreviewDTO;
import com.studyapp.be.services.LinkPreviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@Tag(
        name = "Link Preview",
        description = "Fetch Open Graph metadata (title, description, image, domain) for a given URL"
)
@RestController
@RequestMapping("/link-previews")
@RequiredArgsConstructor
public class LinkPreviewController {

    private final LinkPreviewService previewService;

    @Operation(
            summary = "Fetch link preview metadata",
            description = "Returns a `LinkMeta` object containing title, description, image URL, and domain."
    )
    @GetMapping
    public ResponseEntity<LinkPreviewDTO> preview(
            @RequestParam String url
    ) throws Exception {
        LinkPreviewDTO meta = previewService.getLinkPreview(url);
        return ResponseEntity.ok(meta);
    }

}
