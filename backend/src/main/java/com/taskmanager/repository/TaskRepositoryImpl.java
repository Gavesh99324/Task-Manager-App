package com.taskmanager.repository;

import com.taskmanager.enums.TaskPriority;
import com.taskmanager.enums.TaskStatus;
import com.taskmanager.model.Task;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@RequiredArgsConstructor
public class TaskRepositoryImpl implements TaskRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    @Override
    public Page<Task> findTasksByFilters(
            String createdById,
            TaskStatus status,
            TaskPriority priority,
            String assigneeEmail,
            String search,
            String sortBy,
            String sortDir,
            Pageable pageable
    ) {
        Criteria criteria = buildFilterCriteria(createdById, status, priority, assigneeEmail, search);

        Query countQuery = new Query(criteria);
        long total = mongoTemplate.count(countQuery, Task.class);

        Sort sort = buildSort(sortBy, sortDir);
        Query dataQuery = new Query(criteria)
                .with(sort)
                .skip((long) pageable.getPageNumber() * pageable.getPageSize())
                .limit(pageable.getPageSize());

        List<Task> tasks = mongoTemplate.find(dataQuery, Task.class);
        return new PageImpl<>(tasks, pageable, total);
    }

    @Override
    public long countOverdueTasks(String createdById, LocalDate today) {
        Criteria criteria = Criteria.where("created_by_id").is(createdById)
                .and("due_date").lt(today)
                .and("status").ne(TaskStatus.DONE.name());
        return mongoTemplate.count(new Query(criteria), Task.class);
    }

    @Override
    public long countCompletedToday(String createdById, LocalDateTime startOfDay, LocalDateTime endOfDay) {
        Criteria criteria = Criteria.where("created_by_id").is(createdById)
                .and("completed_at").gte(startOfDay).lt(endOfDay);
        return mongoTemplate.count(new Query(criteria), Task.class);
    }

    private Criteria buildFilterCriteria(
            String createdById,
            TaskStatus status,
            TaskPriority priority,
            String assigneeEmail,
            String search
    ) {
        List<Criteria> conditions = new ArrayList<>();
        conditions.add(Criteria.where("created_by_id").is(createdById));

        if (status != null) {
            conditions.add(Criteria.where("status").is(status.name()));
        }
        if (priority != null) {
            conditions.add(Criteria.where("priority").is(priority.name()));
        }
        if (StringUtils.hasText(assigneeEmail)) {
            conditions.add(Criteria.where("assignee_email")
                    .regex("^" + Pattern.quote(assigneeEmail) + "$", "i"));
        }
        if (StringUtils.hasText(search)) {
            conditions.add(Criteria.where("title").regex(Pattern.quote(search), "i"));
        }

        return new Criteria().andOperator(conditions.toArray(new Criteria[0]));
    }

    private Sort buildSort(String sortBy, String sortDir) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        String field = switch (sortBy != null ? sortBy : "createdAt") {
            case "dueDate"   -> "due_date";
            case "priority"  -> "priority_order";  // numeric field ensures LOW<MEDIUM<HIGH order
            default          -> "created_at";
        };

        return Sort.by(direction, field).and(Sort.by(Sort.Direction.DESC, "created_at"));
    }
}
