package com.studyapp.be.mappers;

import com.studyapp.be.dto.response.FriendShipResponseDto;
import com.studyapp.be.entities.FriendShip;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FriendShipMapper {
    FriendShipResponseDto entityToDto(FriendShip fr);
}
