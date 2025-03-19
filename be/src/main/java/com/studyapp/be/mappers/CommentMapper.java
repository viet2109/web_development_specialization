package com.studyapp.be.mappers;

import com.studyapp.be.dto.request.CreateCommentRequestDto;
import com.studyapp.be.dto.response.CommentResponseDto;
import com.studyapp.be.entities.PostComment;
import com.studyapp.be.entities.bases.Comment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CommentMapper {
    CommentResponseDto entityToDto(Comment comment);

    CommentResponseDto entityToDto(PostComment comment);

    PostComment dtoToPostCommentEntity(CreateCommentRequestDto dto);
}
