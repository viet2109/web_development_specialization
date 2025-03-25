package com.studyapp.be.specifications;

import com.studyapp.be.entities.FriendShipRequest;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class FriendShipRequestSpecification {

    public static Specification<FriendShipRequest> hasSender(Long senderId) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("sender").get("id"), senderId);
    }

    public static Specification<FriendShipRequest> hasReceiver(Long receiverId) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("receiver").get("id"), receiverId);
    }

    public static Specification<FriendShipRequest> createdAfter(LocalDateTime dateTime) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), dateTime);
    }

    public static Specification<FriendShipRequest> createdBefore(LocalDateTime dateTime) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), dateTime);
    }
}

