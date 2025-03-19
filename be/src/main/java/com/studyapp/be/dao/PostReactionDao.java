package com.studyapp.be.dao;

import com.studyapp.be.dao.bases.BaseReactionDao;
import com.studyapp.be.entities.Post;
import com.studyapp.be.entities.PostReaction;
import org.springframework.stereotype.Repository;

@Repository
public interface PostReactionDao extends BaseReactionDao<PostReaction, Long> {
    long countByPost(Post post);
}
