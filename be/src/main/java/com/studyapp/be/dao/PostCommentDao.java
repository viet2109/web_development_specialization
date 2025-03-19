package com.studyapp.be.dao;

import com.studyapp.be.dao.bases.BaseCommentDao;
import com.studyapp.be.entities.Post;
import com.studyapp.be.entities.PostComment;
import org.springframework.stereotype.Repository;

@Repository
public interface PostCommentDao extends BaseCommentDao<PostComment, Long> {
    @Override
    long countByParent(PostComment parent);

    long countByPost(Post post);
}
