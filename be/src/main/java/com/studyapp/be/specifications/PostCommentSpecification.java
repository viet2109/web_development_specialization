package com.studyapp.be.specifications;

import com.studyapp.be.entities.PostComment;
import com.studyapp.be.specifications.bases.CommentSpecification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

@Slf4j
public class PostCommentSpecification extends CommentSpecification {
    public static Specification<PostComment> hasPostId(Long postId) {
        return (root, query, criteriaBuilder) -> postId == null ?
                criteriaBuilder.conjunction() :
                criteriaBuilder.equal(root.get("post").get("id"), postId);
    }
}
