package com.taskmanager.repository;

import com.taskmanager.enums.TaskPriority;
import com.taskmanager.enums.TaskStatus;
import com.taskmanager.model.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface TaskRepositoryCustom {

    Page<Task> findTasksByFilters(
            String createdById,
            TaskStatus status,
            TaskPriority priority,
            String assigneeEmail,
            String search,
            String sortBy,
            String sortDir,
            Pageable pageable
    );

    long countOverdueTasks(String createdById, LocalDate today);

    long countCompletedToday(String createdById, LocalDateTime startOfDay, LocalDateTime endOfDay);
}
