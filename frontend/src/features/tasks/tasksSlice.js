import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { tasksApi, dashboardApi } from "../../services/api";

export const fetchTasks = createAsyncThunk(
  "tasks/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await tasksApi.getAll(params);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch tasks",
      );
    }
  },
);

export const fetchTaskById = createAsyncThunk(
  "tasks/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await tasksApi.getById(id);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Task not found");
    }
  },
);

export const createTask = createAsyncThunk(
  "tasks/create",
  async (taskData, { rejectWithValue }) => {
    try {
      const { data } = await tasksApi.create(taskData);
      return data.data;
    } catch (error) {
      const errors = error.response?.data?.errors;
      const message = error.response?.data?.message || "Failed to create task";
      return rejectWithValue(
        errors ? `${message}: ${errors.join(", ")}` : message,
      );
    }
  },
);

export const updateTask = createAsyncThunk(
  "tasks/update",
  async ({ id, data: taskData }, { rejectWithValue }) => {
    try {
      const { data } = await tasksApi.update(id, taskData);
      return data.data;
    } catch (error) {
      const errors = error.response?.data?.errors;
      const message = error.response?.data?.message || "Failed to update task";
      return rejectWithValue(
        errors ? `${message}: ${errors.join(", ")}` : message,
      );
    }
  },
);

export const completeTask = createAsyncThunk(
  "tasks/complete",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await tasksApi.complete(id);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to complete task",
      );
    }
  },
);

export const deleteTask = createAsyncThunk(
  "tasks/delete",
  async (id, { rejectWithValue }) => {
    try {
      await tasksApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete task",
      );
    }
  },
);

export const fetchDashboard = createAsyncThunk(
  "tasks/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await dashboardApi.getStats();
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard",
      );
    }
  },
);

const tasksSlice = createSlice({
  name: "tasks",
  initialState: {
    items: [],
    currentTask: null,
    pagination: {
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    },
    filters: {
      status: "",
      priority: "",
      assigneeEmail: "",
      search: "",
      sortBy: "createdAt",
      sortDir: "desc",
    },
    dashboard: null,
    loading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentTask(state) {
      state.currentTask = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.content;
        state.pagination = {
          page: action.payload.page,
          size: action.payload.size,
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
          first: action.payload.first,
          last: action.payload.last,
        };
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchTaskById
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createTask
      .addCase(createTask.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // updateTask
      .addCase(updateTask.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentTask = action.payload;
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // completeTask
      .addCase(completeTask.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(completeTask.fulfilled, (state, action) => {
        state.actionLoading = false;
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.currentTask?.id === action.payload.id)
          state.currentTask = action.payload;
      })
      .addCase(completeTask.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // deleteTask
      .addCase(deleteTask.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items = state.items.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // fetchDashboard
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearCurrentTask, clearError } = tasksSlice.actions;
export default tasksSlice.reducer;
