package com.studyapp.be.enums;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public enum AppError {
    // Authentication Errors
    AUTH_INVALID_CREDENTIALS("Invalid username or password", HttpStatus.UNAUTHORIZED),
    AUTH_TOKEN_EXPIRED("Authentication token has expired", HttpStatus.UNAUTHORIZED),
    AUTH_TOKEN_INVALID("Invalid authentication token", HttpStatus.UNAUTHORIZED),
    AUTH_ACCESS_DENIED("Access denied for the requested resource", HttpStatus.FORBIDDEN),

    // User Errors
    USER_NOT_FOUND("The requested user was not found", HttpStatus.NOT_FOUND),
    USER_EMAIL_ALREADY_EXISTS("The email is already registered", HttpStatus.CONFLICT),
    USER_PHONE_ALREADY_EXISTS("The phone is already registered", HttpStatus.CONFLICT),
    USER_PROFILE_NOT_UPDATED("Failed to update user profile", HttpStatus.BAD_REQUEST),

    //VerificationEmailToken Errors
    TOKEN_NOT_FOUND("The token was not found", HttpStatus.NOT_FOUND),
    TOKEN_EXPIRED("Token has expired", HttpStatus.UNAUTHORIZED),

    // Message Errors
    MESSAGE_NOT_FOUND("The requested message was not found", HttpStatus.NOT_FOUND),
    MESSAGE_SEND_FAILED("Failed to send the message", HttpStatus.BAD_REQUEST),
    MESSAGE_EMPTY_CONTENT("Message content cannot be empty", HttpStatus.BAD_REQUEST),

    // Chat Room Errors
    CHATROOM_ALREADY_EXISTS("The chat room is already exist", HttpStatus.CONFLICT),
    CHATROOM_NOT_FOUND("The requested chat room was not found", HttpStatus.NOT_FOUND),
    CHATROOM_CREATION_FAILED("Failed to create chat room", HttpStatus.BAD_REQUEST),
    CHATROOM_ACCESS_DENIED("You do not have access to this chat room", HttpStatus.FORBIDDEN),

    //Reaction Errors
    REACTION_NOT_FOUND("The reaction was not found", HttpStatus.NOT_FOUND),
    REACTION_ALREADY_EXISTS("You has already reacted to this message", HttpStatus.CONFLICT),

    //Comment Errors
    COMMENT_NOT_FOUND("The comment was not found", HttpStatus.NOT_FOUND),
    COMMENT_ATTACHMENT_NOT_FOUND("The comment attachment was not found", HttpStatus.NOT_FOUND),

    //Post Errors
    POST_NOT_FOUND("The post was not found", HttpStatus.NOT_FOUND),

    //File Errors
    FILE_NOT_FOUND("The file was not found", HttpStatus.NOT_FOUND),
    FILE_UPLOAD_FAILED("The file was upload failed", HttpStatus.INTERNAL_SERVER_ERROR),

    //Friendship request Errors
    FRIEND_REQUEST_NOT_FOUND("The friend request not founded", HttpStatus.NOT_FOUND),
    FRIEND_REQUEST_ALREADY_EXIST("The friend request has been sended", HttpStatus.CONFLICT),

    //Friendship Errors
    FRIENDSHIP_NOT_FOUND("The friendship not founded", HttpStatus.NOT_FOUND),

    // General Errors
    INTERNAL_SERVER_ERROR("An unexpected error occurred on the server", HttpStatus.INTERNAL_SERVER_ERROR),
    BAD_REQUEST("The request could not be understood or was missing required parameters", HttpStatus.BAD_REQUEST);

    String message;
    HttpStatus httpStatus;
}

