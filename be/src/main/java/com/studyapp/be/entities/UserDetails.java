package com.studyapp.be.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.studyapp.be.enums.Gender;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class UserDetails {

    @Id
    private Long id;

    private String firstName;
    private String lastName;

    @OneToOne
    @MapsId
    @JoinColumn(nullable = false)
    @JsonIgnore
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Column(unique = true)
    private String phone;
    private LocalDate birthDate;
    private String bio;

    @OneToOne
    private File avatar;
}
