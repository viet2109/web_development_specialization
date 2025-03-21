package com.studyapp.be.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "friendships", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user1_id", "user2_id"})
})
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class FriendShip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(nullable = false)
    private User user1;

    @ManyToOne
    @JoinColumn(nullable = false)
    private User user2;
    private LocalDateTime createdAt;
}
