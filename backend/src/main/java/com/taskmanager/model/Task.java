package com.taskmanager.model;

import com.taskmanager.enums.TaskPriority;
import com.taskmanager.enums.TaskStatus;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    private String id;

    private String title;

    private String description;

    private TaskStatus status;

    private TaskPriority priority;

    // Numeric sort order: LOW=1, MEDIUM=2, HIGH=3 — used for priority-based sorting in MongoDB
    @Field("priority_order")
    private int priorityOrder;

    @Field("due_date")
    private LocalDate dueDate;

    @Field("assignee_email")
    @Indexed
    private String assigneeEmail;

    @Field("assignee_name")
    private String assigneeName;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("completed_at")
    private LocalDateTime completedAt;

    @Field("created_by_id")
    @Indexed
    private String createdById;

    @Field("created_by_name")
    private String createdByName;

    @Field("created_by_email")
    private String createdByEmail;
}
