package com.studyapp.be.dao;

import com.studyapp.be.entities.FriendShipRequest;
import com.studyapp.be.entities.User;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FriendRequestDao extends CrudRepository<FriendShipRequest, Long>, JpaSpecificationExecutor<FriendShipRequest> {
    boolean existsBySender(User sender);

    boolean existsByReceiver(User receiver);
    boolean existsBySenderIdAndReceiverId(Long senderId, Long receiverId);

}
