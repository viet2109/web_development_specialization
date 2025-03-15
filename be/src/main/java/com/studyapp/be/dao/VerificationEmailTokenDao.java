package com.studyapp.be.dao;

import com.studyapp.be.entities.User;
import com.studyapp.be.entities.VerificationEmailToken;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationEmailTokenDao extends CrudRepository<VerificationEmailToken, Long> {
    Optional<VerificationEmailToken> findByToken(String token);
    void deleteAllByUser(User user);
}
