package com.studyapp.be.mappers;

import com.studyapp.be.dto.response.ChatRoomResponseDto;
import com.studyapp.be.entities.ChatRoom;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ChatRoomMapper {
    ChatRoomResponseDto entityToDto(ChatRoom chatRoom);
}
