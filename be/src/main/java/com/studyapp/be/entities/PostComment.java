package com.studyapp.be.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.studyapp.be.entities.bases.Comment;
import com.studyapp.be.enums.CommentType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@DiscriminatorValue(CommentType.POST)
@Setter
@Getter
public class PostComment extends Comment {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    @JsonIgnore
    private Post post;

    @OneToOne(mappedBy = "comment", cascade = CascadeType.ALL, orphanRemoval = true)
    private PostCommentAttachment attachment;

    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PostCommentReaction> reactions;
}
