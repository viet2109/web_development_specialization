package com.studyapp.be.services;

import com.google.firebase.messaging.BatchResponse;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.studyapp.be.dao.UserDao;
import com.studyapp.be.dao.UserFcmTokenDao;
import com.studyapp.be.dto.response.FcmTokenResponseDto;
import com.studyapp.be.entities.User;
import com.studyapp.be.entities.UserFcmToken;
import com.studyapp.be.enums.AppError;
import com.studyapp.be.exceptions.AppException;
import com.studyapp.be.mappers.FcmTokenMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmService {
    private final UserFcmTokenDao userFcmTokenDao;
    private final UserDao userDao;
    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_DELAY_MS = 500;
    private final FcmTokenMapper fcmTokenMapper;

    public String sendToAllUsers(String title, String body, Map<String, String> dataPayload) {
        return sendToTopic("all_users", title, body, dataPayload);
    }

    public String sendToGroup(String topic, String title, String body, Map<String, String> dataPayload) {
        return sendToTopic(topic, title, body, dataPayload);
    }

    private User getUserFromRequest() {
        return userDao.findByEmail(((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername()).orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND));
    }

    public void sendToUser(Long userId, String title, String body, Map<String, String> dataPayload) {
        User user = userDao.findById(userId)
                .orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND));

        List<String> tokens = userFcmTokenDao.findByUser(user)
                .stream()
                .map(UserFcmToken::getToken)
                .toList();

        List<Message> messages = tokens.stream()
                .map(token -> createMessage(token, title, body, dataPayload))
                .collect(Collectors.toList());

        sendBatch(messages);
    }

    private String sendToTopic(String topic, String title, String body, Map<String, String> dataPayload) {
        Message.Builder messageBuilder = Message.builder()
                .setTopic(topic);
        if (dataPayload == null) {
            dataPayload = new HashMap<>();
        } else {
            dataPayload = new HashMap<>(dataPayload);
        }
        dataPayload.put("title", title);
        dataPayload.put("body", body);
        messageBuilder.putAllData(dataPayload);
        Message message = messageBuilder.build();

        return sendSingle(message);
    }

    private Message createMessage(String token, String title, String body, Map<String, String> dataPayload) {
        Message.Builder messageBuilder = Message.builder()
                .setToken(token);
        if (dataPayload == null) {
            dataPayload = new HashMap<>();
        } else {
            dataPayload = new HashMap<>(dataPayload);
        }
        dataPayload.put("title", title);
        dataPayload.put("body", body);
        messageBuilder.putAllData(dataPayload);

        return messageBuilder.build();
    }

    private String sendSingle(Message message) {
        try {
            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Notification sent successfully: {}", response);
            return response;
        } catch (FirebaseMessagingException e) {
            log.error("Failed to send notification: {}", e.getMessage());
            throw new RuntimeException("Error sending FCM message", e);
        }
    }

    private void sendBatch(List<Message> messages) {
        for (int attempt = 0, delay = (int) INITIAL_DELAY_MS; attempt < MAX_RETRIES; attempt++) {
            try {
                BatchResponse response = FirebaseMessaging.getInstance().sendEach(messages);
                log.info("Successfully sent {} messages", response.getSuccessCount());
                response.getSuccessCount();
                return;
            } catch (FirebaseMessagingException e) {
                log.error("Failed to send batch notification, attempt {}: {}", attempt + 1, e.getMessage());
                if (attempt == MAX_RETRIES - 1) {
                    throw new RuntimeException("Exceeded max retries. Last error: " + e.getMessage(), e);
                }
                try {
                    Thread.sleep(delay);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Retry process was interrupted.");
                }
                delay *= 2;
            }
        }
        throw new RuntimeException("Failed to send notifications after retries");
    }

    @Transactional
    public FcmTokenResponseDto createFcmToken(String token) {
        UserFcmToken fcmToken = UserFcmToken
                .builder()
                .user(getUserFromRequest())
                .token(token)
                .build();
        return fcmTokenMapper.entityToDto(userFcmTokenDao.save(fcmToken));
    }

    @Transactional
    public void deleteFcmToken(String token) {
        userFcmTokenDao.deleteByUserAndToken(getUserFromRequest(), token);
    }
}
