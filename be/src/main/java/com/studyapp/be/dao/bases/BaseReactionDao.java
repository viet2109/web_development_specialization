package com.studyapp.be.dao.bases;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface BaseReactionDao<T, ID> extends CrudRepository<T, ID> {
}
