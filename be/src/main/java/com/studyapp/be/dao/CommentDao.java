package com.studyapp.be.dao;

import com.studyapp.be.dao.bases.BaseCommentDao;
import com.studyapp.be.entities.bases.Comment;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentDao extends BaseCommentDao<Comment, Long> {
    @Query(value = "SELECT type FROM comments WHERE id = :id", nativeQuery = true)
    Optional<String> findTypeById(@Param("id") Long id);
}
