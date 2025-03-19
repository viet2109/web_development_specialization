package com.studyapp.be.services;

import com.studyapp.be.dao.*;
import com.studyapp.be.dto.request.CreateCommentRequestDto;
import com.studyapp.be.dto.request.CreatePostRequestDto;
import com.studyapp.be.dto.response.CommentResponseDto;
import com.studyapp.be.dto.response.FileResponseDto;
import com.studyapp.be.dto.response.PostResponseDto;
import com.studyapp.be.dto.response.ReactionResponseDto;
import com.studyapp.be.entities.*;
import com.studyapp.be.enums.AppError;
import com.studyapp.be.exceptions.AppException;
import com.studyapp.be.mappers.CommentMapper;
import com.studyapp.be.mappers.PostMapper;
import com.studyapp.be.mappers.ReactionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostService {
    private final PostDao postDao;
    private final PostMapper postMapper;
    private final UserDao userDao;
    private final FileService fileService;
    private final FileDao fileDao;
    private final PostCommentDao commentDao;
    private final ReactionMapper reactionMapper;
    private final PostReactionDao reactionDao;
    private final CommentMapper commentMapper;
    private final PostCommentDao postCommentDao;
    private final PostReactionDao postReactionDao;

    @Transactional
    public PostResponseDto createPost(CreatePostRequestDto createPostRequestDto) {
        Post post = postMapper.dtoToEntity(createPostRequestDto);
        User user = userDao.findById(getUserFromRequest().getId()).orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND));
        post.setCreator(user);
        if (createPostRequestDto.getSharedPostId() != null) {
            Post sharedPost = postDao.findById(createPostRequestDto.getSharedPostId()).orElseThrow(() -> new AppException(AppError.POST_NOT_FOUND));
            post.setSharedPost(sharedPost);
        }

        if (createPostRequestDto.getFiles() != null && !createPostRequestDto.getFiles().isEmpty()) {
            List<CompletableFuture<FileResponseDto>> futures = createPostRequestDto.getFiles().stream().filter(Objects::nonNull).map(file -> CompletableFuture.supplyAsync(() -> fileService.upload(file)).exceptionally(ex -> null)).toList();
            post.setAttachments(futures.stream().map(CompletableFuture::join).filter(Objects::nonNull).map(file -> fileDao.findById(file.getId()).orElseThrow(() -> new AppException(AppError.FILE_NOT_FOUND))).collect(Collectors.toSet()));
        }
        return postMapper.entityToDto(postDao.save(post));
    }

    public Page<PostResponseDto> getRankedPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return postDao.findRankedPostsByUser(getUserFromRequest().getId(), pageable).map(post ->
        {
            PostResponseDto dto = postMapper.entityToDto(post);
            dto.setTotalComments(postCommentDao.countByPost(post));
            dto.setTotalReactions(postReactionDao.countByPost(post));
            return dto;
        });
    }

    private User getUserFromRequest() {
        return userDao.findByEmail(((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername()).orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND));
    }

    @Transactional
    public void deletePost(Long postId) {
        Post post = postDao.findById(postId).orElseThrow(() -> new AppException(AppError.POST_NOT_FOUND));
        if (!post.getCreator().getId().equals(getUserFromRequest().getId())) {
            throw new AppException(AppError.AUTH_ACCESS_DENIED);
        }
        postDao.delete(post);
    }

    @Transactional
    public ReactionResponseDto createReaction(Long postId, String emoji) {
        Post post = postDao.findById(postId).orElseThrow(() -> new AppException(AppError.POST_NOT_FOUND));
        if (post.getReactions().stream().anyMatch(reaction -> reaction.getCreator().getId().equals(getUserFromRequest().getId()))) {
            throw new AppException(AppError.REACTION_ALREADY_EXISTS);
        }

        PostReaction reaction = new PostReaction();
        reaction.setEmoji(emoji);
        reaction.setCreator(getUserFromRequest());
        reaction.setPost(post);

        PostReaction persistedReaction = reactionDao.save(reaction);
        return reactionMapper.entityToDto(persistedReaction);
    }

    @Transactional
    public void deleteReaction(Long postId, Long reactionId) {
        Post post = postDao.findById(postId).orElseThrow(() -> new AppException(AppError.POST_NOT_FOUND));
        if (!post.getCreator().getId().equals(getUserFromRequest().getId())) {
            throw new AppException(AppError.AUTH_ACCESS_DENIED);
        }
        PostReaction reaction = reactionDao.findById(reactionId).orElseThrow(() -> new AppException(AppError.REACTION_NOT_FOUND));
        post.getReactions().remove(reaction);
        postDao.save(post);
    }

    @Transactional
    public CommentResponseDto createComment(Long postId, CreateCommentRequestDto dto) {
        Post post = postDao.findById(postId).orElseThrow(() -> new AppException(AppError.POST_NOT_FOUND));
        PostComment comment = commentMapper.dtoToPostCommentEntity(dto);
        if (dto.getParentId() != null) {
            comment.setParent(commentDao.findById(dto.getParentId()).orElseThrow(() -> new AppException(AppError.COMMENT_NOT_FOUND)));
        }
        comment.setCreator(getUserFromRequest());
        if (dto.getAttachmentFile() != null) {
            FileResponseDto fileResponseDto = fileService.upload(dto.getAttachmentFile());
            PostCommentAttachment attachment = new PostCommentAttachment();
            attachment.setFile(fileDao.findById(fileResponseDto.getId()).orElseThrow(() -> new AppException(AppError.FILE_NOT_FOUND)));
            comment.setAttachment(attachment);
        }
        comment.setPost(post);
        PostComment savedComment = commentDao.save(comment);
        return commentMapper.entityToDto(savedComment);
    }


    @Transactional
    public void deleteComment(Long postId, Long commentId) {
        Post post = postDao.findById(postId).orElseThrow(() -> new AppException(AppError.POST_NOT_FOUND));
        PostComment comment = commentDao.findById(commentId).orElseThrow(() -> new AppException(AppError.COMMENT_NOT_FOUND));
        if (!comment.getCreator().getId().equals(getUserFromRequest().getId())) {
            throw new AppException(AppError.AUTH_ACCESS_DENIED);
        }
        post.getComments().remove(comment);
        postDao.save(post);
    }
}
