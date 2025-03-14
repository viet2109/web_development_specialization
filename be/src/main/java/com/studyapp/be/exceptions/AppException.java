package com.studyapp.be.exceptions;

import com.studyapp.be.enums.AppError;
import lombok.Getter;

@Getter
public class AppException extends RuntimeException {
    private final AppError error;

    public AppException(AppError error) {
        super(error.getMessage());
        this.error = error;
    }
}
