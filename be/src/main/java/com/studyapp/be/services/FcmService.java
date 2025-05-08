package com.studyapp.be.services;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.studyapp.be.dao.UserDao;
import com.studyapp.be.entities.User;
import com.studyapp.be.enums.AppError;
import com.studyapp.be.exceptions.AppException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmService {
    private final UserDao userDao;
    private final SecurityService securityService;

    public String sendToAllUsers(String title, String body, Map<String, String> dataPayload) {
        return sendToTopic("all_users", title, body, dataPayload);
    }

    public String sendToGroup(String topic, String title, String body, Map<String, String> dataPayload) {
        return sendToTopic(topic, title, body, dataPayload);
    }

    public void sendToUser(Long userId, String title, String body, Map<String, String> dataPayload) {
        User user = userDao.findById(userId).orElseThrow(() -> new AppException(AppError.USER_NOT_FOUND));
        String topic = "user_" + user.getId();
        sendToTopic(topic, title, body, dataPayload);
    }

    private String sendToTopic(String topic, String title, String body, Map<String, String> dataPayload) {
        Message.Builder messageBuilder = Message.builder().setTopic(topic);
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

    public void createFcmToken(String token) {
        try {
            FirebaseMessaging.getInstance().subscribeToTopic(List.of(token), "user_" + securityService.getUserFromRequest().getId());
        } catch (FirebaseMessagingException e) {
            throw new AppException(AppError.INTERNAL_SERVER_ERROR);
        }
    }

    public void createFcmTokenForAllUser(String token) {
        try {
            FirebaseMessaging.getInstance().subscribeToTopic(List.of(token), "all_users");
        } catch (FirebaseMessagingException e) {
            throw new AppException(AppError.INTERNAL_SERVER_ERROR);
        }
    }

    public void deleteFcmToken(String token) {
        try {
            FirebaseMessaging.getInstance().unsubscribeFromTopic(List.of(token), "user_" + securityService.getUserFromRequest().getId());
        } catch (FirebaseMessagingException e) {
            throw new AppException(AppError.INTERNAL_SERVER_ERROR);
        }
    }
}
