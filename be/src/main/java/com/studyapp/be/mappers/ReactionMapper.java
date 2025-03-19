package com.studyapp.be.mappers;

import com.studyapp.be.dto.response.ReactionResponseDto;
import com.studyapp.be.entities.bases.Reaction;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ReactionMapper {
    ReactionResponseDto entityToDto(Reaction reaction);
}
