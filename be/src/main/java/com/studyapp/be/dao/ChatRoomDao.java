package com.studyapp.be.dao;

import com.studyapp.be.entities.ChatRoom;
import com.studyapp.be.entities.User;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRoomDao extends CrudRepository<ChatRoom, Long>, JpaSpecificationExecutor<ChatRoom> {
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END " +
            "FROM ChatRoom c JOIN c.members m " +
            "WHERE c.creator = :creator AND m.user = :creator " +
            "GROUP BY c.id " +
            "HAVING COUNT(m) = 1")
    boolean existsCloudChatRoom(@Param("creator") User creator);
}
