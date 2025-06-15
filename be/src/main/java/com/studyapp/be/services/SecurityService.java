package com.studyapp.be.services;

import com.studyapp.be.dao.UserDao;
import com.studyapp.be.entities.User;
import com.studyapp.be.enums.AppError;
import com.studyapp.be.exceptions.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SecurityService {
    private final UserDao userDao;

    public User getUserFromRequest() {
        return userDao.findByEmail(((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername()).orElse(null);
    }
}
