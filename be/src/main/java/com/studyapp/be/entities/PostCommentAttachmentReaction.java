package com.studyapp.be.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.studyapp.be.entities.bases.Reaction;
import com.studyapp.be.enums.ReactionType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@DiscriminatorValue(ReactionType.POST_COMMENT_ATTACHMENT)
@Getter
@Setter
public class PostCommentAttachmentReaction extends Reaction {

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    private PostCommentAttachment attachment;
}
