package com.studyapp.be.specifications;

import com.studyapp.be.entities.ChatRoom;
import com.studyapp.be.entities.User;
import com.studyapp.be.enums.ChatRoomType;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class ChatRoomSpecification {

    public static Specification<ChatRoom> hasName(String name) {
        return (root, query, criteriaBuilder) ->
                name == null || name.isEmpty() ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("name"), name);
    }

    public static Specification<ChatRoom> hasType(ChatRoomType type) {
        return (root, query, criteriaBuilder) ->
                type == null ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("type"), type);
    }

    public static Specification<ChatRoom> hasCreator(Long creatorId) {
        return (root, query, criteriaBuilder) ->
                creatorId == null ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("creator").get("id"), creatorId);
    }

    public static Specification<ChatRoom> hasMember(Long userId) {
        return (root, query, criteriaBuilder) -> {
            if (userId == null) return criteriaBuilder.conjunction();
            Join<ChatRoom, User> membersJoin = root.join("members");
            return criteriaBuilder.equal(membersJoin.get("user").get("id"), userId);
        };
    }

    public static Specification<ChatRoom> createdAfter(LocalDateTime date) {
        return (root, query, criteriaBuilder) ->
                date == null ? criteriaBuilder.conjunction() : criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), date);
    }

    public static Specification<ChatRoom> combineAll(String name, ChatRoomType type, Long creatorId, Long userId, LocalDateTime createdAfter) {
        return (root, query, criteriaBuilder) -> {
            Predicate predicate = criteriaBuilder.conjunction();
            if (name != null && !name.isEmpty()) {
                predicate = criteriaBuilder.and(predicate, hasName(name).toPredicate(root, query, criteriaBuilder));
            }
            if (type != null) {
                predicate = criteriaBuilder.and(predicate, hasType(type).toPredicate(root, query, criteriaBuilder));
            }
            if (creatorId != null) {
                predicate = criteriaBuilder.and(predicate, hasCreator(creatorId).toPredicate(root, query, criteriaBuilder));
            }
            if (userId != null) {
                predicate = criteriaBuilder.and(predicate, hasMember(userId).toPredicate(root, query, criteriaBuilder));
            }
            if (createdAfter != null) {
                predicate = criteriaBuilder.and(predicate, createdAfter(createdAfter).toPredicate(root, query, criteriaBuilder));
            }
            return predicate;
        };
    }
}
