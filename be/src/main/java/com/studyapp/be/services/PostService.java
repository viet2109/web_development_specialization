package com.studyapp.be.services;

import com.studyapp.be.dao.CommentDao;
import com.studyapp.be.dao.FileDao;
import com.studyapp.be.dao.PostDao;
import com.studyapp.be.dao.UserDao;
import com.studyapp.be.dto.request.CreatePostRequestDto;
import com.studyapp.be.dto.response.FileResponseDto;
import com.studyapp.be.dto.response.PostResponseDto;
import com.studyapp.be.entities.Post;
import com.studyapp.be.entities.User;
import com.studyapp.be.enums.AppError;
import com.studyapp.be.exceptions.AppException;
import com.studyapp.be.mappers.PostMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostDao postDao;
    private final PostMapper postMapper;
    private final UserDao userDao;
    private final FileService fileService;
    private final FileDao fileDao;
    private final CommentDao commentDao;

    @Transactional
    public PostResponseDto createPost(CreatePostRequestDto createPostRequestDto) {
        Post post = postMapper.dtoToEntity(createPostRequestDto);
        User user = userDao.findById(createPostRequestDto.getUserId()).orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND));
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

    public Page<PostResponseDto> getRankedPosts(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return postDao.findRankedPostsByUser(userId, pageable).map(postMapper::entityToDto);
    }
}
