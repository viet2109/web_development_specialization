package com.studyapp.be.mappers;

import com.studyapp.be.dto.request.CreateMessageRequestDto;
import com.studyapp.be.dto.response.MessageResponseDto;
import com.studyapp.be.entities.Message;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MessageMapper {
    MessageResponseDto entityToDto(Message entity);

    Message dtoToEntity(CreateMessageRequestDto messageRequestDto);
}
