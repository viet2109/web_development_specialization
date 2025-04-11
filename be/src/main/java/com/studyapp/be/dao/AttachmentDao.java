package com.studyapp.be.dao;

import com.studyapp.be.dao.bases.BaseAttachmentDao;
import com.studyapp.be.entities.bases.Attachment;
import org.springframework.stereotype.Repository;

@Repository
public interface AttachmentDao extends BaseAttachmentDao<Attachment, Long> {
}
