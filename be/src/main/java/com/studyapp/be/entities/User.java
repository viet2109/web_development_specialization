package com.studyapp.be.entities;

import com.studyapp.be.enums.ActiveStatus;
import com.studyapp.be.enums.Role;
import com.studyapp.be.enums.UserStatus;
import jakarta.persistence.*;
import lombok.Getter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    @ElementCollection
    private Set<Role> roles;

    private UserStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private UserDetails details;

    private LocalDateTime lastActive;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActiveStatus activeStatus;

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
