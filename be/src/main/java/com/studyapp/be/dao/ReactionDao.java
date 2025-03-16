package com.studyapp.be.dao;

import com.studyapp.be.entities.Reaction;
import org.springframework.data.repository.CrudRepository;

public interface ReactionDao extends CrudRepository<Reaction, Long> {
}
