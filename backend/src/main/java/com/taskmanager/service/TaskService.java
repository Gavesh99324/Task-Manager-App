package com.taskmanager.service;

import com.taskmanager.dto.request.TaskRequest;
import com.taskmanager.dto.response.PageResponse;
import com.taskmanager.dto.response.TaskResponse;
import com.taskmanager.enums.TaskPriority;
import com.taskmanager.enums.TaskStatus;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final SecurityUtils securityUtils;

    @Value("${app.pagination.max-page-size}")
    private int maxPageSize;

    public PageResponse<TaskResponse> getTasks(
            TaskStatus status,
            TaskPriority priority,
            String assigneeEmail,
            String search,
            String sortBy,
            String sortDir,
            int page,
            int size
    ) {
        User currentUser = securityUtils.getCurrentUser();
        Pageable pageable = PageRequest.of(page, Math.min(size, maxPageSize));

        String resolvedSortBy = (sortBy != null) ? sortBy : "createdAt";
        String resolvedSortDir = (sortDir != null) ? sortDir.toLowerCase() : "desc";

        Page<Task> taskPage = taskRepository.findTasksByFilters(
                currentUser.getId(), status, priority, assigneeEmail, search,
                resolvedSortBy, resolvedSortDir, pageable
        );

        List<TaskResponse> responses = taskPage.getContent().stream()
                .map(TaskResponse::fromEntity)
                .toList();

        return PageResponse.of(
                responses,
                taskPage.getNumber(),
                taskPage.getSize(),
                taskPage.getTotalElements(),
                taskPage.getTotalPages()
        );
    }

    public TaskResponse getTaskById(String id) {
        Task task = findTaskByIdAndOwner(id);
        return TaskResponse.fromEntity(task);
    }

    public TaskResponse createTask(TaskRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus())
                .priority(request.getPriority())
                .priorityOrder(request.getPriority().getSortOrder())
                .dueDate(request.getDueDate())
                .assigneeEmail(request.getAssigneeEmail())
                .assigneeName(request.getAssigneeName())
                .createdById(currentUser.getId())
                .createdByName(currentUser.getName())
                .createdByEmail(currentUser.getEmail())
                .build();

        if (task.getStatus() == TaskStatus.DONE) {
            task.setCompletedAt(LocalDateTime.now());
        }

        Task savedTask = taskRepository.save(task);
        return TaskResponse.fromEntity(savedTask);
    }

    public TaskResponse updateTask(String id, TaskRequest request) {
        Task task = findTaskByIdAndOwner(id);

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setPriorityOrder(request.getPriority().getSortOrder());
        task.setDueDate(request.getDueDate());
        task.setAssigneeEmail(request.getAssigneeEmail());
        task.setAssigneeName(request.getAssigneeName());

        TaskStatus previousStatus = task.getStatus();
        task.setStatus(request.getStatus());

        if (request.getStatus() == TaskStatus.DONE && previousStatus != TaskStatus.DONE) {
            task.setCompletedAt(LocalDateTime.now());
        } else if (request.getStatus() != TaskStatus.DONE) {
            task.setCompletedAt(null);
        }

        Task savedTask = taskRepository.save(task);
        return TaskResponse.fromEntity(savedTask);
    }

    public TaskResponse completeTask(String id) {
        Task task = findTaskByIdAndOwner(id);

        task.setStatus(TaskStatus.DONE);
        task.setCompletedAt(LocalDateTime.now());

        Task savedTask = taskRepository.save(task);
        return TaskResponse.fromEntity(savedTask);
    }

    public void deleteTask(String id) {
        Task task = findTaskByIdAndOwner(id);
        taskRepository.delete(task);
    }

    private Task findTaskByIdAndOwner(String id) {
        User currentUser = securityUtils.getCurrentUser();
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        if (!task.getCreatedById().equals(currentUser.getId())) {
            // 404 intentional: avoids revealing existence of tasks belonging to other users
            throw new ResourceNotFoundException("Task", "id", id);
        }

        return task;
    }
}
