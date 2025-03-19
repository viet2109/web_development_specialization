package com.studyapp.be.entities;

import com.studyapp.be.entities.bases.Reaction;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@DiscriminatorValue("POST")
@Getter
@Setter
public class PostReaction extends Reaction {

    @ManyToOne
    private Post post;
}
