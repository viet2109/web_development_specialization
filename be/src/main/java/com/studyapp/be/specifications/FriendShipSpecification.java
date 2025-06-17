package com.studyapp.be.specifications;

import com.studyapp.be.entities.FriendShip;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class FriendShipSpecification {

    public static Specification<FriendShip> hasUser(Long userId) {
        return (root, query, cb) -> cb.or(
                cb.equal(root.get("user1").get("id"), userId),
                cb.equal(root.get("user2").get("id"), userId)
        );
    }

    public static Specification<FriendShip> hasNameLike(String namePattern) {
        return (root, query, cb) -> {
            String pattern = "%" + namePattern.toLowerCase() + "%";
            Predicate name1 = cb.or(
                    cb.like(cb.lower(root.get("user1").get("firstName")), pattern),
                    cb.like(cb.lower(root.get("user1").get("lastName")), pattern)
            );
            Predicate name2 = cb.or(
                    cb.like(cb.lower(root.get("user2").get("firstName")), pattern),
                    cb.like(cb.lower(root.get("user2").get("lastName")), pattern)
            );
            return cb.or(name1, name2);
        };
    }

}

