package com.studyapp.be.mappers;

import com.studyapp.be.dto.response.FriendShipRequestResponseDto;
import com.studyapp.be.entities.FriendShipRequest;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FriendShipRequestMapper {
    FriendShipRequestResponseDto entityToDto(FriendShipRequest fr);
}
