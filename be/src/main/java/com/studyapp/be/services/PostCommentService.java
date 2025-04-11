package com.studyapp.be.services;

import com.studyapp.be.dao.*;
import com.studyapp.be.dto.request.CreateCommentRequestDto;
import com.studyapp.be.dto.response.CommentResponseDto;
import com.studyapp.be.entities.*;
import com.studyapp.be.enums.AppError;
import com.studyapp.be.exceptions.AppException;
import com.studyapp.be.mappers.CommentMapper;
import com.studyapp.be.specifications.PostCommentSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostCommentService {
    private final PostCommentDao commentDao;
    private final CommentMapper commentMapper;
    private final UserDao userDao;
    private final PostCommentReactionDao postCommentReactionDao;
    private final PostCommentAttachmentReactionDao postCommentAttachmentReactionDao;
    private final PostDao postDao;
    private final FileService fileService;

    @Transactional
    public CommentResponseDto createComment(Long postId, CreateCommentRequestDto dto) {
        Post post = postDao.findById(postId).orElseThrow(() -> new AppException(AppError.POST_NOT_FOUND));
        PostComment comment = commentMapper.dtoToPostCommentEntity(dto);
        if (dto.getParentId() != null) {
            comment.setParent(commentDao.findById(dto.getParentId()).orElseThrow(() -> new AppException(AppError.COMMENT_NOT_FOUND)));
        }
        comment.setCreator(getUserFromRequest());
        if (dto.getAttachmentFile() != null) {
            File file = fileService.upload(dto.getAttachmentFile());
            PostCommentAttachment attachment = new PostCommentAttachment();
            attachment.setFile(file);
            comment.setAttachment(attachment);
        }
        comment.setPost(post);
        PostComment savedComment = commentDao.save(comment);
        return commentMapper.entityToDto(savedComment);
    }

    public Page<CommentResponseDto> getComments(Long parentId, Long postId, Pageable pageable) {
        Specification<PostComment> spec = Specification.where(null);
        if (parentId != null) {
            spec = spec.and(PostCommentSpecification.hasParentId(parentId));
        } else {
            spec = spec.and(PostCommentSpecification.isHasParent(false));
        }

        if (postId != null) {
            spec = spec.and(PostCommentSpecification.hasPostId(postId));
        }

        return commentDao.findAll(spec, pageable).map(comment -> {
            CommentResponseDto dto = commentMapper.entityToDto(comment);
            dto.setTotalChildren(commentDao.countByParent(comment));
            dto.setReactionSummary(postCommentReactionDao.getReactionSummaryByComment(comment));
            if (dto.getAttachment() != null) {
                dto.getAttachment().setReactionSummary(postCommentAttachmentReactionDao.getReactionSummaryByAttachment(comment.getAttachment()));
            }
            return dto;
        });
    }

    private User getUserFromRequest() {
        return userDao.findByEmail(((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername()).orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND));
    }
}
