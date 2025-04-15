package com.studyapp.be.entities;

import com.studyapp.be.enums.ChatRoomType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChatRoomType type;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(nullable = false)
    private User creator;

    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ChatRoomMember> members;

    @PrePersist
    public void prePersist() {
        if (name == null && members != null && !members.isEmpty() && type != null) {
            if (type == ChatRoomType.GROUP) {
                name = members.stream().filter(member -> !Objects.equals(member.getUser().getId(), creator.getId())).map(member -> getUsername(member.getUser())).collect(Collectors.joining(", "));
            } else {
                name = members.stream().map(member -> getUsername(member.getUser())).collect(Collectors.joining(", "));
            }
        }
    }

    private String getUsername(User user) {
        return user.getLastName().trim() + " " + user.getFirstName().trim();
    }
}
