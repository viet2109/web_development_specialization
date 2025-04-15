package com.studyapp.be.dao;

import com.studyapp.be.entities.Message;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageDao extends CrudRepository<Message, Long>, JpaSpecificationExecutor<Message> {
}
