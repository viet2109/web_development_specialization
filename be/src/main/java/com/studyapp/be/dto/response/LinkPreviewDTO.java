package com.studyapp.be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LinkPreviewDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
    private String url;
    private String title;
    private String description;
    private String imageUrl;
    private String domain;
    private String faviconUrl;
    private String siteName;
}
