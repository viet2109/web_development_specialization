package com.studyapp.be.services;

import com.studyapp.be.dao.ReactionDao;
import com.studyapp.be.dao.UserDao;
import com.studyapp.be.dto.response.ReactionResponseDto;
import com.studyapp.be.entities.User;
import com.studyapp.be.entities.bases.Reaction;
import com.studyapp.be.enums.AppError;
import com.studyapp.be.exceptions.AppException;
import com.studyapp.be.mappers.ReactionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReactionService {
    private final ReactionDao reactionDao;
    private final ReactionMapper reactionMapper;
    private final UserDao userDao;

    @Transactional
    public ReactionResponseDto updateReaction(Long reactionId, String emoji) {
        Reaction reaction = reactionDao.findById(reactionId).orElseThrow(() -> new AppException(AppError.REACTION_NOT_FOUND));
        if (!reaction.getCreator().getId().equals(getUserFromRequest().getId())) {
            throw new AppException(AppError.AUTH_ACCESS_DENIED);
        }
        reaction.setEmoji(emoji);
        return reactionMapper.entityToDto(reactionDao.save(reaction));
    }

    private User getUserFromRequest() {
        return userDao.findByEmail(((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername()).orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND));
    }
}
