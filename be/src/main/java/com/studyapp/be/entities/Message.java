package com.studyapp.be.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.studyapp.be.enums.MessageStatus;
import com.studyapp.be.enums.ReplyTargetType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(indexes = {
        @Index(name = "idx_replied_target_id", columnList = "repliedTargetId"),
})
@ToString
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(nullable = false)
    @JsonIgnore
    private ChatRoom room;

    @ManyToOne
    private User sender;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(columnDefinition = "TEXT")
    private String content;

    @OneToMany(mappedBy = "message", fetch = FetchType.EAGER, orphanRemoval = true, cascade = CascadeType.ALL)
    private List<MessageAttachment> attachments;

    @Column(nullable = false)
    private Boolean isDeleted;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageStatus status;

    @OneToMany(mappedBy = "message", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<MessageReaction> reactions;

    private Long repliedTargetId;

    @Enumerated(EnumType.STRING)
    private ReplyTargetType repliedTargetType;

    @PrePersist
    public void initDefaultValue() {
        if (isDeleted == null) {
            isDeleted = false;
        }
    }
}
