package com.studyapp.be.dao.bases;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface BaseAttachmentDao<T, ID> extends CrudRepository<T, ID>, JpaSpecificationExecutor<T> {
}
