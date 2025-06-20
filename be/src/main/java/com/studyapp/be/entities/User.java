package com.studyapp.be.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.studyapp.be.enums.ActiveStatus;
import com.studyapp.be.enums.Gender;
import com.studyapp.be.enums.Role;
import com.studyapp.be.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Set;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = "phone"))
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    @ElementCollection(fetch = FetchType.EAGER)
    private Set<Role> roles;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime lastActive;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActiveStatus activeStatus;

    private String firstName;
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;
    private String phone;
    private LocalDate birthDate;
    private String bio;

    @OneToOne
    @JsonManagedReference

    private File avatar;

    @PrePersist
    protected void onCreate() {
        if (roles == null || roles.isEmpty()) {
            roles = Collections.singleton(Role.USER);
        }
        if (status == null) {
            status = UserStatus.INACTIVE;
        }
        if (activeStatus == null) {
            activeStatus = ActiveStatus.OFFLINE;
        }
    }
}
