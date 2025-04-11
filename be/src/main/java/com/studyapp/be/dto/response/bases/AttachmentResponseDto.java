package com.studyapp.be.dto.response.bases;

import com.studyapp.be.dto.response.FileResponseDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AttachmentResponseDto {
    private Long id;
    private FileResponseDto file;
}
