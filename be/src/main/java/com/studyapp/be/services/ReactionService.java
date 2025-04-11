package com.studyapp.be.services;

import com.studyapp.be.dao.ReactionDao;
import com.studyapp.be.dto.response.ReactionResponseDto;
import com.studyapp.be.entities.User;
import com.studyapp.be.entities.bases.Reaction;
import com.studyapp.be.enums.AppError;
import com.studyapp.be.exceptions.AppException;
import com.studyapp.be.mappers.ReactionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReactionService {
    private final ReactionMapper reactionMapper;
    private final ReactionDao reactionDao;
    private final SecurityService securityService;

    @Transactional
    public ReactionResponseDto updateReaction(Long reactionId, String emoji) {
        Reaction reaction = reactionDao.findById(reactionId).orElseThrow(() -> new AppException(AppError.REACTION_NOT_FOUND));
        User currentUser = securityService.getUserFromRequest();
        if (!reaction.getCreator().getId().equals(currentUser.getId())) {
            throw new AppException(AppError.AUTH_ACCESS_DENIED);
        }
        reaction.setEmoji(emoji);
        return reactionMapper.entityToDto(reactionDao.save(reaction));
    }

    @Transactional
    public void deleteReaction(Long reactionId) {
        Reaction reaction = reactionDao.findById(reactionId).orElseThrow(() -> new AppException(AppError.REACTION_NOT_FOUND));
        User currentUser = securityService.getUserFromRequest();
        if (!reaction.getCreator().getId().equals(currentUser.getId())) {
            throw new AppException(AppError.AUTH_ACCESS_DENIED);
        }
        reactionDao.delete(reaction);
    }

}
