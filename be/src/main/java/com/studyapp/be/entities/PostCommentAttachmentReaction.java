package com.studyapp.be.entities;

import com.studyapp.be.entities.bases.Reaction;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@DiscriminatorValue("POST_COMMENT_ATTACHMENT")
@Getter
@Setter
public class PostCommentAttachmentReaction extends Reaction {

    @ManyToOne
    private PostCommentAttachment attachment;
}
