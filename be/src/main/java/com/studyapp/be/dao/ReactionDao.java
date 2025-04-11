package com.studyapp.be.dao;

import com.studyapp.be.dao.bases.BaseReactionDao;
import com.studyapp.be.entities.bases.Reaction;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReactionDao extends BaseReactionDao<Reaction, Long> {
    @Query(value = "SELECT type FROM reactions WHERE id = :id", nativeQuery = true)
    Optional<String> findTypeById(@Param("id") Long id);

}
