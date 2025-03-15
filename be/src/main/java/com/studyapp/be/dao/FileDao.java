package com.studyapp.be.dao;

import com.studyapp.be.entities.File;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FileDao extends CrudRepository<File, Long> {
}
