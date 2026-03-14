package com.taskmanager.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.taskmanager.enums.TaskPriority;
import com.taskmanager.enums.TaskStatus;
import com.taskmanager.model.Task;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TaskResponse {

    private String id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private LocalDate dueDate;
    private String assigneeEmail;
    private String assigneeName;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private String createdById;
    private String createdByName;

    public static TaskResponse fromEntity(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .assigneeEmail(task.getAssigneeEmail())
                .assigneeName(task.getAssigneeName())
                .createdAt(task.getCreatedAt())
                .completedAt(task.getCompletedAt())
                .createdById(task.getCreatedById())
                .createdByName(task.getCreatedByName())
                .build();
    }
}
