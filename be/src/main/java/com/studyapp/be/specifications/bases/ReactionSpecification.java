package com.studyapp.be.specifications.bases;

import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class ReactionSpecification {

    public static <T> Specification<T> hasEmoji(String emoji) {
        return (root, query, builder) -> builder.equal(root.get("emoji"), emoji);
    }

    public static <T> Specification<T> hasCreatorId(Long creatorId) {
        return (root, query, builder) -> builder.equal(root.get("creator").get("id"), creatorId);
    }

    public static <T> Specification<T> createdAfter(LocalDateTime date) {
        return (root, query, builder) -> builder.greaterThan(root.get("createdAt"), date);
    }

    public static <T> Specification<T> createdBefore(LocalDateTime date) {
        return (root, query, builder) -> builder.lessThan(root.get("createdAt"), date);
    }

    public static <T> Specification<T> updatedAfter(LocalDateTime date) {
        return (root, query, builder) -> builder.greaterThan(root.get("updatedAt"), date);
    }
}

