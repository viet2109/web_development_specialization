package com.studyapp.be.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "friendship_requests")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class FriendShipRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(nullable = false)
    private User sender;

    @ManyToOne
    @JoinColumn(nullable = false)
    private User receiver;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
