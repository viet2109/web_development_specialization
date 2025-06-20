package com.studyapp.be.dao;

import com.studyapp.be.entities.FriendShip;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FriendDao extends CrudRepository<FriendShip, Long>, JpaSpecificationExecutor<FriendShip> {
    @Query("SELECT COUNT(f) FROM FriendShip f WHERE f.user1.id = :userId OR f.user2.id = :userId")
    long countByUserId(@Param("userId") Long userId);


    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM FriendShip  f " +
            "WHERE (f.user1.id = :userId1 AND f.user2.id = :userId2) " +
            "   OR (f.user1.id = :userId2 AND f.user2.id = :userId1)")
    boolean existsByUserIds(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
