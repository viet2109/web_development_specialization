package com.studyapp.be.services;

import com.studyapp.be.dao.*;
import com.studyapp.be.dto.response.ReactionResponseDto;
import com.studyapp.be.entities.*;
import com.studyapp.be.entities.bases.Comment;
import com.studyapp.be.enums.AppError;
import com.studyapp.be.enums.CommentType;
import com.studyapp.be.exceptions.AppException;
import com.studyapp.be.mappers.ReactionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final UserDao userDao;
    private final PostCommentDao postCommentDao;
    private final CommentDao commentDao;
    private final PostCommentReactionDao postCommentReactionDao;
    private final ReactionMapper reactionMapper;
    private final PostCommentAttachmentReactionDao postCommentAttachmentReactionDao;
    private final SecurityService securityService;


    @Transactional
    public void delete(Long id) {
        Comment comment = commentDao.findById(id).orElseThrow(() -> new AppException(AppError.COMMENT_NOT_FOUND));
        User currentUser = securityService.getUserFromRequest();
        if (!currentUser.getId().equals(comment.getCreator().getId())) {
            throw new AppException(AppError.AUTH_ACCESS_DENIED);
        }
        commentDao.delete(comment);
    }

    @Transactional
    public ReactionResponseDto createReaction(Long commentId, String emoji) {
        String type = commentDao.findTypeById(commentId)
                .orElseThrow(() -> new AppException(AppError.COMMENT_NOT_FOUND));
        if (CommentType.POST.equals(type)) {
            PostComment comment = postCommentDao.findById(commentId).orElseThrow(() -> new AppException(AppError.COMMENT_NOT_FOUND));
            User creator = securityService.getUserFromRequest();
            if (postCommentReactionDao.existsByCommentAndCreator(comment, creator)) {
                throw new AppException(AppError.REACTION_ALREADY_EXISTS);
            }
            PostCommentReaction reaction = new PostCommentReaction();
            reaction.setEmoji(emoji);
            reaction.setCreator(creator);
            reaction.setComment(comment);
            PostCommentReaction savedReaction = postCommentReactionDao.save(reaction);
            return reactionMapper.entityToDto(savedReaction);
        } else {
            throw new AppException(AppError.COMMENT_NOT_FOUND);
        }
    }

    @Transactional
    public ReactionResponseDto createAttachmentReaction(Long commentId, String emoji) {
        String type = commentDao.findTypeById(commentId)
                .orElseThrow(() -> new AppException(AppError.COMMENT_NOT_FOUND));
        if (CommentType.POST.equals(type)) {
            PostComment comment = postCommentDao.findById(commentId).orElseThrow(() -> new AppException(AppError.COMMENT_NOT_FOUND));
            User creator = securityService.getUserFromRequest();

            PostCommentAttachment attachment = comment.getAttachment();
            if (attachment == null) {
                throw new AppException(AppError.COMMENT_ATTACHMENT_NOT_FOUND);
            }
            if (postCommentAttachmentReactionDao.existsByAttachmentAndCreator(attachment, creator)) {
                throw new AppException(AppError.REACTION_ALREADY_EXISTS);
            }
            PostCommentAttachmentReaction reaction = new PostCommentAttachmentReaction();
            reaction.setEmoji(emoji);
            reaction.setCreator(creator);
            reaction.setAttachment(comment.getAttachment());
            PostCommentAttachmentReaction savedReaction = postCommentAttachmentReactionDao.save(reaction);
            return reactionMapper.entityToDto(savedReaction);
        } else {
            throw new AppException(AppError.COMMENT_NOT_FOUND);
        }
    }
}
