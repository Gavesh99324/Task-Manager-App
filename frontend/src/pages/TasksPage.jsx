import { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { fetchTasks, setFilters } from "../features/tasks/tasksSlice";
import TaskCard from "../components/tasks/TaskCard";
import TaskFilters from "../components/tasks/TaskFilters";
import { PageLoader } from "../components/common/LoadingSpinner";
import ErrorAlert from "../components/common/ErrorAlert";
import AddIcon from "@mui/icons-material/Add";
import InboxIcon from "@mui/icons-material/Inbox";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const DEBOUNCE_DELAY = 350;

export default function TasksPage() {
  const dispatch = useDispatch();
  const { items, pagination, filters, loading, error } = useSelector(
    (state) => state.tasks,
  );
  const [searchParams] = useSearchParams();
  const searchTimerRef = useRef(null);

  // Apply query params as initial filters (e.g., from Dashboard quick links)
  useEffect(() => {
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    if (status || priority) {
      dispatch(setFilters({ status: status || "", priority: priority || "" }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTasks = useCallback(
    (page = 0) => {
      dispatch(
        fetchTasks({
          page,
          size: pagination.size,
          ...(filters.status && { status: filters.status }),
          ...(filters.priority && { priority: filters.priority }),
          ...(filters.assigneeEmail && {
            assigneeEmail: filters.assigneeEmail,
          }),
          ...(filters.search && { search: filters.search }),
          sortBy: filters.sortBy,
          sortDir: filters.sortDir,
        }),
      );
    },
    [dispatch, filters, pagination.size],
  );

  useEffect(() => {
    clearTimeout(searchTimerRef.current);
    // Debounce search field; fire immediately for other filter changes
    if (filters.search !== undefined) {
      searchTimerRef.current = setTimeout(() => loadTasks(0), DEBOUNCE_DELAY);
    } else {
      loadTasks(0);
    }
    return () => clearTimeout(searchTimerRef.current);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (newPage) => {
    loadTasks(newPage);
  };

  const activeFilterCount = [
    filters.status,
    filters.priority,
    filters.assigneeEmail,
    filters.search,
  ].filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
          <p className="text-slate-500 text-sm mt-1">
            {pagination.totalElements > 0
              ? `${pagination.totalElements} task${pagination.totalElements !== 1 ? "s" : ""} total`
              : "Manage all your tasks"}
          </p>
        </div>
        <Link to="/tasks/new" className="btn-primary shrink-0">
          <AddIcon fontSize="small" />
          New Task
        </Link>
      </div>

      {/* Filters */}
      <TaskFilters filters={filters} />

      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
          </span>
          <button
            onClick={() =>
              dispatch(
                setFilters({
                  status: "",
                  priority: "",
                  assigneeEmail: "",
                  search: "",
                }),
              )
            }
            className="text-xs text-primary-600 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {error && <ErrorAlert message={error} />}

      {/* Task grid */}
      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <InboxIcon className="text-slate-200" sx={{ fontSize: 64 }} />
          <h3 className="text-base font-semibold text-slate-600 mt-4">
            {activeFilterCount > 0
              ? "No tasks match your filters"
              : "No tasks yet"}
          </h3>
          <p className="text-slate-400 text-sm mt-1 mb-6">
            {activeFilterCount > 0
              ? "Try adjusting your filters to see more results."
              : "Create your first task to get started."}
          </p>
          {activeFilterCount === 0 && (
            <Link to="/tasks/new" className="btn-primary">
              <AddIcon fontSize="small" /> Create Task
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDeleted={() => loadTasks(pagination.page)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-slate-500">
                Page {pagination.page + 1} of {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.first}
                  className="btn-secondary px-3 disabled:opacity-40"
                >
                  <NavigateBeforeIcon fontSize="small" /> Prev
                </button>
                {/* Page number buttons */}
                <div className="hidden sm:flex gap-1">
                  {Array.from(
                    { length: Math.min(pagination.totalPages, 5) },
                    (_, i) => {
                      const pageNum = i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-9 h-9 text-sm rounded-lg font-medium transition-colors ${
                            pageNum === pagination.page
                              ? "bg-primary-600 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    },
                  )}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.last}
                  className="btn-secondary px-3 disabled:opacity-40"
                >
                  Next <NavigateNextIcon fontSize="small" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
