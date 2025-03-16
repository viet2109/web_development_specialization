package com.studyapp.be.entities;

import jakarta.persistence.*;

import java.util.Set;

@Entity
@Table(name = "comment_attachments")
public class CommentAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private File file;

    @OneToMany
    private Set<Reaction> reactions;
}
