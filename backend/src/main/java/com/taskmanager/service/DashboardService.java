package com.taskmanager.service;

import com.taskmanager.dto.response.DashboardResponse;
import com.taskmanager.enums.TaskPriority;
import com.taskmanager.enums.TaskStatus;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.model.User;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public DashboardResponse getDashboardStats() {
        User currentUser = getCurrentUser();
        String userId = currentUser.getId();
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();

        return DashboardResponse.builder()
                .totalTasks(taskRepository.countByCreatedById(userId))
                .todoCount(taskRepository.countByCreatedByIdAndStatus(userId, TaskStatus.TODO))
                .inProgressCount(taskRepository.countByCreatedByIdAndStatus(userId, TaskStatus.IN_PROGRESS))
                .doneCount(taskRepository.countByCreatedByIdAndStatus(userId, TaskStatus.DONE))
                .lowPriorityCount(taskRepository.countByCreatedByIdAndPriority(userId, TaskPriority.LOW))
                .mediumPriorityCount(taskRepository.countByCreatedByIdAndPriority(userId, TaskPriority.MEDIUM))
                .highPriorityCount(taskRepository.countByCreatedByIdAndPriority(userId, TaskPriority.HIGH))
                .overdueCount(taskRepository.countOverdueTasks(userId, today))
                .completedTodayCount(taskRepository.countCompletedToday(userId, startOfDay, endOfDay))
                .build();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }
}
