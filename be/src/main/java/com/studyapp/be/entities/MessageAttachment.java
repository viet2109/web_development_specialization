package com.studyapp.be.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.studyapp.be.entities.bases.Attachment;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@DiscriminatorValue("MESSAGE")
@Setter
@Getter
public class MessageAttachment extends Attachment {

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private Message message;

    @OneToMany(mappedBy = "attachment", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<MessageAttachmentReaction> reactions;
}
