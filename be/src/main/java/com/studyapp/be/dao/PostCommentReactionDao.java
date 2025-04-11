package com.studyapp.be.dao;

import com.studyapp.be.dao.bases.BaseReactionDao;
import com.studyapp.be.dto.response.ReactionSummaryDto;
import com.studyapp.be.entities.PostComment;
import com.studyapp.be.entities.PostCommentReaction;
import com.studyapp.be.entities.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostCommentReactionDao extends BaseReactionDao<PostCommentReaction, Long> {
    @Query("SELECT new com.studyapp.be.dto.response.ReactionSummaryDto(r.emoji, COUNT(r)) " +
            "FROM PostCommentReaction r WHERE r.comment = :comment GROUP BY r.emoji")
    List<ReactionSummaryDto> getReactionSummaryByComment(@Param("comment") PostComment comment);

    boolean existsByCommentAndCreator(PostComment comment, User creator);
}
