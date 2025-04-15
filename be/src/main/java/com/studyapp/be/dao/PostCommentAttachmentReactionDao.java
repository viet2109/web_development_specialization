package com.studyapp.be.dao;

import com.studyapp.be.dao.bases.BaseReactionDao;
import com.studyapp.be.dto.response.ReactionSummaryDto;
import com.studyapp.be.entities.PostCommentAttachment;
import com.studyapp.be.entities.PostCommentAttachmentReaction;
import com.studyapp.be.entities.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostCommentAttachmentReactionDao extends BaseReactionDao<PostCommentAttachmentReaction, Long> {
    @Query("SELECT new com.studyapp.be.dto.response.ReactionSummaryDto(r.emoji, COUNT(r)) " +
            "FROM PostCommentAttachmentReaction r WHERE r.attachment = :attachment GROUP BY r.emoji")
    List<ReactionSummaryDto> getReactionSummaryByAttachment(@Param("attachment") PostCommentAttachment attachment);

    boolean existsByAttachmentAndCreator(PostCommentAttachment attachment, User creator);
}
