package com.studyapp.be.specifications.bases;

import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class CommentSpecification {

    public static <T> Specification<T> hasParentId(Long parentId) {
        return (root, query, criteriaBuilder) -> parentId == null ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("parent").get("id"), parentId);
    }

    public static <T> Specification<T> isHasParent(Boolean isHasParent) {
        return (root, query, criteriaBuilder) -> isHasParent == null ? criteriaBuilder.conjunction() : isHasParent ? criteriaBuilder.isNotNull(root.get("parent")) : criteriaBuilder.isNull(root.get("parent"));
    }

    public static <T> Specification<T> hasContent(String content) {
        return (root, query, criteriaBuilder) -> {
            if (content == null || content.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(root.get("content"), "%" + content + "%");
        };
    }

    public static <T> Specification<T> hasCreatorId(Long creatorId) {
        return (root, query, criteriaBuilder) -> {
            if (creatorId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("creator").get("id"), creatorId);
        };
    }

    public static <T> Specification<T> createdAfter(LocalDateTime date) {
        return (root, query, criteriaBuilder) -> {
            if (date == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), date);
        };
    }

    public static <T> Specification<T> createdBefore(LocalDateTime date) {
        return (root, query, criteriaBuilder) -> {
            if (date == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), date);
        };
    }
}
