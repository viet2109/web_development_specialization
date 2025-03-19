package com.studyapp.be.specifications;

import com.studyapp.be.entities.PostReaction;
import com.studyapp.be.specifications.bases.ReactionSpecification;
import org.springframework.data.jpa.domain.Specification;

public class PostReactionSpecification extends ReactionSpecification {
    public static Specification<PostReaction> hasPostId(Long postId) {
        return (root, query, criteriaBuilder) -> postId == null ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("post").get("id"), postId);
    }
}
