package com.studyapp.be.dao;

import com.studyapp.be.dao.bases.BaseReactionDao;
import com.studyapp.be.entities.PostComment;
import com.studyapp.be.entities.PostCommentReaction;
import org.springframework.stereotype.Repository;

@Repository
public interface PostCommentReactionDao extends BaseReactionDao<PostCommentReaction, Long> {
    long countByComment(PostComment comment);
}
