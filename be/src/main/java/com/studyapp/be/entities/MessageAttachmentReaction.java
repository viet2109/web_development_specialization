package com.studyapp.be.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.studyapp.be.entities.bases.Reaction;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@DiscriminatorValue("MESSAGE_ATTACHMENT")
@Setter
@Getter
public class MessageAttachmentReaction extends Reaction {

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    private MessageAttachment attachment;
}
