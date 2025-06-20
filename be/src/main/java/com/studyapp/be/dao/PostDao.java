package com.studyapp.be.dao;

import com.studyapp.be.entities.Post;
import com.studyapp.be.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PostDao extends CrudRepository<Post, Long>, JpaSpecificationExecutor<Post> {

    @Query("SELECT p " +
            "FROM Post p " +
            "LEFT JOIN PostReaction r ON  r.post.id = p.id " +
            "LEFT JOIN PostComment c ON c.post.id = p.id " +
            "LEFT JOIN FriendShip fs ON ((fs.user1.id = :userId AND fs.user2.id = p.creator.id) " +
            "                           OR (fs.user2.id = :userId AND fs.user1.id = p.creator.id)) " +
            "GROUP BY p " +
            "ORDER BY " +
            "  CASE WHEN p.creator.id = :userId THEN 0 " +
            "       WHEN MAX(fs.id) IS NOT NULL THEN 1 " +
            "       ELSE 2 END ASC, " +
            "  COUNT(r) DESC, " +
            "  COUNT(c) DESC, " +
            "  p.createdAt DESC")
    Page<Post> findRankedPostsByUser(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.creator.id = :userId ORDER BY p.createdAt DESC")
    Page<Post> findPostsByUserId(@Param("userId") Long userId, Pageable pageable);
    long countByCreator(User creator);


}
