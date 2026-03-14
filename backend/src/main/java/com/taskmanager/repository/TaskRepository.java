package com.taskmanager.repository;

import com.taskmanager.enums.TaskPriority;
import com.taskmanager.enums.TaskStatus;
import com.taskmanager.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends MongoRepository<Task, String>, TaskRepositoryCustom {

    long countByCreatedByIdAndStatus(String createdById, TaskStatus status);

    long countByCreatedByIdAndPriority(String createdById, TaskPriority priority);

    long countByCreatedById(String createdById);
}
