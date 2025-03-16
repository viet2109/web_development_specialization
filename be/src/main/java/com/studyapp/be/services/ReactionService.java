package com.studyapp.be.services;

import com.studyapp.be.dao.ReactionDao;
import com.studyapp.be.dto.response.ReactionResponseDto;
import com.studyapp.be.entities.Reaction;
import com.studyapp.be.enums.AppError;
import com.studyapp.be.exceptions.AppException;
import com.studyapp.be.mappers.ReactionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReactionService {
    private final ReactionDao reactionDao;
    private final ReactionMapper reactionMapper;

    @Transactional
    public ReactionResponseDto updateReaction(Long reactionId, String emoji) {
        Reaction reaction = reactionDao.findById(reactionId).orElseThrow(() -> new AppException(AppError.REACTION_NOT_FOUND));
        reaction.setEmoji(emoji);
        return reactionMapper.entityToDto(reactionDao.save(reaction));
    }
}
