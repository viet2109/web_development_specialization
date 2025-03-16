package com.studyapp.be.dao;

import com.studyapp.be.entities.Comment;
import com.studyapp.be.entities.Post;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentDao extends CrudRepository<Comment, Long> {
    long countByPost(Post post);
}
