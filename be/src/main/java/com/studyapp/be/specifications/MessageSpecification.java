package com.studyapp.be.specifications;

import com.studyapp.be.entities.Message;
import com.studyapp.be.entities.MessageAttachment;
import com.studyapp.be.enums.MessageStatus;
import com.studyapp.be.enums.MessageType;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class MessageSpecification {

    public static Specification<Message> hasSender(Long senderId) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("sender").get("id"), senderId);
    }

    public static Specification<Message> hasRoom(Long roomId) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("room").get("id"), roomId);
    }

    public static Specification<Message> hasStatus(MessageStatus status) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("status"), status);
    }

    public static Specification<Message> isHasFiles() {
        return (root, query, criteriaBuilder) -> {
            if (query != null) query.distinct(true);
            Join<Message, MessageAttachment> attachmentsJoin = root.join("attachments", JoinType.INNER);
            return criteriaBuilder.isNotNull(attachmentsJoin.get("id"));
        };
    }

    public static Specification<Message> hasType(MessageType type) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("type"), type);
    }

    public static Specification<Message> isDeleted(Boolean isDeleted) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("isDeleted"), isDeleted);
    }

    public static Specification<Message> createdAtBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.between(root.get("createdAt"), startDate, endDate);
    }

    public static Specification<Message> hasContent(String keyword) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(criteriaBuilder.lower(root.get("content")), "%" + keyword.toLowerCase() + "%");
    }

    public static Specification<Message> combineAll(
            Long senderId, Long roomId, MessageStatus status, MessageType type,
            Boolean isDeleted, LocalDateTime startDate, LocalDateTime endDate, String keyword, Boolean isHasFiles) {
        return (root, query, criteriaBuilder) -> {
            Predicate predicate = criteriaBuilder.conjunction();

            if (senderId != null) {
                predicate = criteriaBuilder.and(predicate, hasSender(senderId).toPredicate(root, query, criteriaBuilder));
            }
            if (roomId != null) {
                predicate = criteriaBuilder.and(predicate, hasRoom(roomId).toPredicate(root, query, criteriaBuilder));
            }
            if (status != null) {
                predicate = criteriaBuilder.and(predicate, hasStatus(status).toPredicate(root, query, criteriaBuilder));
            }
            if (type != null) {
                predicate = criteriaBuilder.and(predicate, hasType(type).toPredicate(root, query, criteriaBuilder));
            }
            if (isDeleted != null) {
                predicate = criteriaBuilder.and(predicate, isDeleted(isDeleted).toPredicate(root, query, criteriaBuilder));
            }
            if (startDate != null && endDate != null) {
                predicate = criteriaBuilder.and(predicate, createdAtBetween(startDate, endDate).toPredicate(root, query, criteriaBuilder));
            }
            if (keyword != null && !keyword.isBlank()) {
                predicate = criteriaBuilder.and(predicate, hasContent(keyword).toPredicate(root, query, criteriaBuilder));
            }
            if (isHasFiles != null && isHasFiles) {
                predicate = criteriaBuilder.and(predicate, isHasFiles().toPredicate(root, query, criteriaBuilder));
            }

            return predicate;
        };
    }
}
