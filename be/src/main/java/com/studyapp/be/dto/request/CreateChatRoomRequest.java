package com.studyapp.be.dto.request;

import com.studyapp.be.enums.ChatRoomType;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateChatRoomRequest {
    private String name;

    @NotEmpty(message = "Member IDs cannot be empty")
    @Size(min = 1, message = "Number of member must be at least 1")
    private Set<@NotNull(message = "Member ID cannot be null") Long> memberIds;

    @NotNull(message = "Chat type cannot be null")
    private ChatRoomType chatType;

    @AssertTrue(message = "For private chat type, the number of members must be 1")
    public boolean isValidForPrivateChat() {
        if (chatType == ChatRoomType.PRIVATE) {
            return memberIds.size() == 1;
        }
        return true;
    }
}

