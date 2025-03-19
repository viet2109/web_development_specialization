package com.studyapp.be.dao;

import com.studyapp.be.dao.bases.BaseReactionDao;
import com.studyapp.be.entities.PostCommentAttachment;
import com.studyapp.be.entities.PostCommentAttachmentReaction;
import org.springframework.stereotype.Repository;

@Repository
public interface PostCommentAttachmentReactionDao extends BaseReactionDao<PostCommentAttachmentReaction, Long> {
    long countByAttachment(PostCommentAttachment attachment);
}
