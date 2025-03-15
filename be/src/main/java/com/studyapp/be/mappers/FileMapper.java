package com.studyapp.be.mappers;

import com.studyapp.be.dto.response.FileResponseDto;
import com.studyapp.be.entities.File;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FileMapper {
    FileResponseDto entityToDto(File file);
}
