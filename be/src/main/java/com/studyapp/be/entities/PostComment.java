package com.studyapp.be.entities;

import com.studyapp.be.entities.bases.Comment;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@DiscriminatorValue("POST")
@Setter
@Getter
public class PostComment extends Comment {

    @ManyToOne
    @JoinColumn(nullable = false)
    private Post post;

    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PostCommentReaction> reactions;
}
