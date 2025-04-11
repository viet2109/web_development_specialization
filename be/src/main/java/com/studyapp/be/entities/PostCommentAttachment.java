package com.studyapp.be.entities;

import com.studyapp.be.entities.bases.Attachment;
import com.studyapp.be.entities.bases.Comment;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@DiscriminatorValue("POST_COMMENT")
@Setter
@Getter
public class PostCommentAttachment extends Attachment {

    @OneToOne
    private Comment comment;

    @OneToMany(mappedBy = "attachment", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PostCommentAttachmentReaction> reactions;
}
