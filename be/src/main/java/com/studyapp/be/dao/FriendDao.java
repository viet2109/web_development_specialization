package com.studyapp.be.dao;

import com.studyapp.be.entities.FriendShip;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FriendDao extends CrudRepository<FriendShip, Long> {
}
