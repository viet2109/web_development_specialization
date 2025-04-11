package com.studyapp.be.controllers;

import com.studyapp.be.dto.response.FileResponseDto;
import com.studyapp.be.mappers.FileMapper;
import com.studyapp.be.services.FileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequiredArgsConstructor
@RequestMapping("/files")
@Tag(name = "File API", description = "APIs for managing file uploads and deletions")
public class FileController {

    private final FileService fileService;
    private final FileMapper fileMapper;

    @Operation(
            summary = "Upload a file",
            description = "Uploads a file and returns details of the uploaded file, including its generated ID."
    )
    @PostMapping("/upload")
    public ResponseEntity<FileResponseDto> upload(
            @Parameter(description = "The file to upload", required = true)
            @RequestParam MultipartFile file) {
        FileResponseDto fileResponseDto = fileMapper.entityToDto(fileService.upload(file));
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(fileResponseDto.getId())
                .toUri();
        return ResponseEntity.created(location).body(fileResponseDto);
    }

    @Operation(
            summary = "Delete a file",
            description = "Deletes a file based on the provided file ID."
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(
            @Parameter(description = "ID of the file to delete", required = true)
            @PathVariable Long id) {
        fileService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
