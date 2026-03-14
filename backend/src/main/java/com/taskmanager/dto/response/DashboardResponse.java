package com.taskmanager.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DashboardResponse {

    private long totalTasks;
    private long todoCount;
    private long inProgressCount;
    private long doneCount;
    private long lowPriorityCount;
    private long mediumPriorityCount;
    private long highPriorityCount;
    private long overdueCount;
    private long completedTodayCount;
}
