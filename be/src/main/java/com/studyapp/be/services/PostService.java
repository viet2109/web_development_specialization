package com.studyapp.be.services;

import com.studyapp.be.dao.PostCommentDao;
import com.studyapp.be.dao.PostDao;
import com.studyapp.be.dao.PostReactionDao;
import com.studyapp.be.dao.UserDao;
import com.studyapp.be.dto.request.CreatePostRequestDto;
import com.studyapp.be.dto.response.PostResponseDto;
import com.studyapp.be.dto.response.ReactionResponseDto;
import com.studyapp.be.entities.*;
import com.studyapp.be.enums.AppError;
import com.studyapp.be.exceptions.AppException;
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
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostService {
    private final PostDao postDao;
    private final PostMapper postMapper;
    private final UserDao userDao;
    private final FileService fileService;
    private final Executor asyncExecutor;
    private final ReactionMapper reactionMapper;
    private final PostReactionDao reactionDao;
    private final PostCommentDao postCommentDao;
    private final PostReactionDao postReactionDao;
    private final SecurityService securityService;


    @Transactional
    public PostResponseDto createPost(CreatePostRequestDto createPostRequestDto) {
        Post post = postMapper.dtoToEntity(createPostRequestDto);
        User user = securityService.getUserFromRequest();
        if (user == null) {
            throw new AppException(AppError.USER_NOT_FOUND);
        }
        post.setCreator(user);
        if (createPostRequestDto.getSharedPostId() != null) {
            Post sharedPost = postDao.findById(createPostRequestDto.getSharedPostId()).orElseThrow(() -> new AppException(AppError.POST_NOT_FOUND));
            post.setSharedPost(sharedPost);
        }

        if (createPostRequestDto.getFiles() != null && !createPostRequestDto.getFiles().isEmpty()) {
            List<CompletableFuture<File>> futures = createPostRequestDto.getFiles().stream().filter(Objects::nonNull).map(file -> CompletableFuture.supplyAsync(() -> fileService.upload(file), asyncExecutor)).toList();
            Set<PostAttachment> attachments = futures.stream().map(CompletableFuture::join).filter(Objects::nonNull).map(file -> {
                PostAttachment attachment = new PostAttachment();
                attachment.setFile(file);
                attachment.setPost(post);
                return attachment;
            }).collect(Collectors.toSet());
            post.setAttachments(attachments);
        }
        Post savedPost = postDao.save(post);

        return postMapper.entityToDto(savedPost);
    }

    public Page<PostResponseDto> getRankedPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        User user = securityService.getUserFromRequest();

        return postDao.findRankedPostsByUser(getUserFromRequest().getId(), pageable).map(post ->
        {
            PostResponseDto dto = postMapper.entityToDto(post);
            dto.setTotalComments(postCommentDao.countByPost(post));
            dto.setReactionSummary(postReactionDao.getReactionSummaryByPost(post));

            Set<PostReaction> reactions = post.getReactions();
            if (user != null && reactions != null) {
                reactions.stream().filter(reaction -> reaction.getCreator().getId().equals(user.getId())).findFirst().ifPresent(reaction -> {
                    dto.setHasReacted(true);
                    dto.setUserReactionEmoji(reaction.getEmoji());
                    dto.setUserReactionId(reaction.getId());
                });
            }
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
        User creator = getUserFromRequest();
        if (postReactionDao.existsByPostAndCreator(post, creator)) {
            throw new AppException(AppError.REACTION_ALREADY_EXISTS);
        }
        PostReaction reaction = new PostReaction();
        reaction.setEmoji(emoji);
        reaction.setCreator(creator);
        reaction.setPost(post);
        PostReaction persistedReaction = reactionDao.save(reaction);
        return reactionMapper.entityToDto(persistedReaction);
    }
    public Page<PostResponseDto> getPostsByUserId(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Post> posts = postDao.findPostsByUserId(userId, pageable);

        User currentUser = securityService.getUserFromRequest();

        return posts.map(post -> {
            PostResponseDto dto = postMapper.entityToDto(post);
            dto.setTotalComments(postCommentDao.countByPost(post));
            dto.setReactionSummary(postReactionDao.getReactionSummaryByPost(post));

            if (currentUser != null) {
                post.getReactions().stream()
                        .filter(r -> r.getCreator().getId().equals(currentUser.getId()))
                        .findFirst()
                        .ifPresent(r -> {
                            dto.setHasReacted(true);
                            dto.setUserReactionEmoji(r.getEmoji());
                            dto.setUserReactionId(r.getId());
                        });
            }

            return dto;
        });
    }
    public long countPostsByUserId(Long userId) {
        if (userId == null) {
            User currentUser = securityService.getUserFromRequest();
            if (currentUser == null) {
                throw new AppException(AppError.USER_NOT_FOUND);
            }
            return postDao.countByCreator(currentUser);
        } else {
            // Tìm user theo ID khác
            User user = userDao.findById(userId)
                    .orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND));
            return postDao.countByCreator(user);
        }
    }


}
