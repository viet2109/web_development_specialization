package com.studyapp.be.dao;

import com.studyapp.be.entities.User;
import com.studyapp.be.entities.UserFcmToken;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserFcmTokenDao extends CrudRepository<UserFcmToken, Long> {
    List<UserFcmToken> findByUser(User user);

    void deleteByUserAndToken(User user, String token);
}
