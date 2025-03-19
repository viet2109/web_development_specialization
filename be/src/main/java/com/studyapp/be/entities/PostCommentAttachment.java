package com.studyapp.be.entities;

import com.studyapp.be.entities.bases.CommentAttachment;
import jakarta.persistence.CascadeType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@DiscriminatorValue("POST_COMMENT")
@Setter
@Getter
public class PostCommentAttachment extends CommentAttachment {
    @OneToMany(mappedBy = "attachment", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PostCommentAttachmentReaction> reactions;
}
