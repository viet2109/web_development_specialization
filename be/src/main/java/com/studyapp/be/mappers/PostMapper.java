package com.studyapp.be.mappers;

import com.studyapp.be.dto.request.CreatePostRequestDto;
import com.studyapp.be.dto.response.PostResponseDto;
import com.studyapp.be.entities.Post;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PostMapper {
    PostResponseDto entityToDto(Post post);
    Post dtoToEntity(CreatePostRequestDto dto);
}
