package com.studyapp.be.services;

import com.studyapp.be.dao.*;
import com.studyapp.be.dto.response.CommentResponseDto;
import com.studyapp.be.dto.response.ReactionResponseDto;
import com.studyapp.be.entities.*;
import com.studyapp.be.enums.AppError;
import com.studyapp.be.exceptions.AppException;
import com.studyapp.be.mappers.CommentMapper;
import com.studyapp.be.mappers.ReactionMapper;
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
    private final ReactionMapper reactionMapper;
    private final PostDao postDao;
    private final PostCommentReactionDao postCommentReactionDao;
    private final PostCommentAttachmentReactionDao postCommentAttachmentReactionDao;

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
            dto.setTotalReactions(postCommentReactionDao.countByComment(comment));
            return dto;
        });
    }

    @Transactional
    public ReactionResponseDto createReaction(Long postId, Long commentId, String emoji) {
        postDao.findById(postId).orElseThrow(() -> new AppException(AppError.POST_NOT_FOUND));
        PostComment comment = commentDao.findById(commentId).orElseThrow(() -> new AppException(AppError.COMMENT_NOT_FOUND));
        if (comment.getReactions().stream().anyMatch(reaction -> reaction.getCreator().getId().equals(getUserFromRequest().getId()))) {
            throw new AppException(AppError.REACTION_ALREADY_EXISTS);
        }
        PostCommentReaction reaction = new PostCommentReaction();
        reaction.setEmoji(emoji);
        reaction.setCreator(userDao.findById(getUserFromRequest().getId()).orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND)));
        reaction.setComment(comment);
        PostCommentReaction savedReaction = postCommentReactionDao.save(reaction);
        return reactionMapper.entityToDto(savedReaction);
    }

    @Transactional
    public void deleteReaction(Long postId, Long commentId, Long reactionId) {
        postDao.findById(postId).orElseThrow(() -> new AppException(AppError.POST_NOT_FOUND));
        PostComment comment = commentDao.findById(commentId).orElseThrow(() -> new AppException(AppError.COMMENT_NOT_FOUND));
        if (!comment.getCreator().getId().equals(getUserFromRequest().getId())) {
            throw new AppException(AppError.AUTH_ACCESS_DENIED);
        }
        comment.getReactions().remove(postCommentReactionDao.findById(reactionId).orElseThrow(() -> new AppException(AppError.REACTION_NOT_FOUND)));
        commentDao.save(comment);
    }

    @Transactional
    public ReactionResponseDto createAttachmentReaction(Long postId, Long commentId, String emoji) {
        postDao.findById(postId).orElseThrow(() -> new AppException(AppError.POST_NOT_FOUND));
        PostComment comment = commentDao.findById(commentId).orElseThrow(() -> new AppException(AppError.COMMENT_NOT_FOUND));
        if (comment.getReactions().stream().anyMatch(reaction -> reaction.getCreator().getId().equals(getUserFromRequest().getId()))) {
            throw new AppException(AppError.REACTION_ALREADY_EXISTS);
        }
        if (comment.getAttachment() == null) {
            throw new AppException(AppError.COMMENT_ATTACHMENT_NOT_FOUND);
        }
        PostCommentAttachmentReaction reaction = new PostCommentAttachmentReaction();
        reaction.setEmoji(emoji);
        reaction.setCreator(userDao.findById(getUserFromRequest().getId()).orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND)));
        reaction.setAttachment((PostCommentAttachment) comment.getAttachment());
        PostCommentAttachmentReaction savedReaction = postCommentAttachmentReactionDao.save(reaction);

        return reactionMapper.entityToDto(savedReaction);
    }

    @Transactional
    public void deleteAttachmentReaction(Long postId, Long commentId) {
        postDao.findById(postId).orElseThrow(() -> new AppException(AppError.POST_NOT_FOUND));
        PostComment comment = commentDao.findById(commentId).orElseThrow(() -> new AppException(AppError.COMMENT_NOT_FOUND));
        if (comment.getAttachment() == null) {
            throw new AppException(AppError.COMMENT_ATTACHMENT_NOT_FOUND);
        }

        if (!comment.getCreator().getId().equals(getUserFromRequest().getId())) {
            throw new AppException(AppError.AUTH_ACCESS_DENIED);
        }
        comment.setAttachment(null);
        commentDao.save(comment);
    }

    private User getUserFromRequest() {
        return userDao.findByEmail(((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername()).orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND));
    }
}
