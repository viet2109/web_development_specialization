package com.studyapp.be.dao;

import com.studyapp.be.dao.bases.BaseReactionDao;
import com.studyapp.be.dto.response.ReactionSummaryDto;
import com.studyapp.be.entities.Post;
import com.studyapp.be.entities.PostReaction;
import com.studyapp.be.entities.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostReactionDao extends BaseReactionDao<PostReaction, Long> {
    @Query("SELECT new com.studyapp.be.dto.response.ReactionSummaryDto(r.emoji, COUNT(r)) " +
            "FROM PostReaction r WHERE r.post = :post GROUP BY r.emoji")
    List<ReactionSummaryDto> getReactionSummaryByPost(@Param("post") Post post);

    boolean existsByPostAndCreator(Post post, User creator);
}
