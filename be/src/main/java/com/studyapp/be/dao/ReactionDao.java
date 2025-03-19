package com.studyapp.be.dao;

import com.studyapp.be.dao.bases.BaseReactionDao;
import com.studyapp.be.entities.bases.Reaction;
import org.springframework.stereotype.Repository;

@Repository
public interface ReactionDao extends BaseReactionDao<Reaction, Long> {
}
