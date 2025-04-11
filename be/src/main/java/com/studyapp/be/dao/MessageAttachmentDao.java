package com.studyapp.be.dao;

import com.studyapp.be.dao.bases.BaseAttachmentDao;
import com.studyapp.be.entities.MessageAttachment;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageAttachmentDao extends BaseAttachmentDao<MessageAttachment, Long> {
}
