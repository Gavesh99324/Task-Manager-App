import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTaskById,
  completeTask,
  deleteTask,
  clearCurrentTask,
} from "../features/tasks/tasksSlice";
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  formatDate,
  formatDateTime,
  isOverdue,
} from "../utils/helpers";
import TaskForm from "../components/tasks/TaskForm";
import { PageLoader } from "../components/common/LoadingSpinner";
import ErrorAlert from "../components/common/ErrorAlert";
import ConfirmDialog from "../components/common/ConfirmDialog";
import toast from "react-hot-toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export default function TaskDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTask, loading, actionLoading, error } = useSelector(
    (state) => state.tasks,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    dispatch(fetchTaskById(id));
    return () => dispatch(clearCurrentTask());
  }, [dispatch, id]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await dispatch(completeTask(currentTask.id)).unwrap();
      toast.success("Task marked as complete!");
    } catch (err) {
      toast.error(err || "Failed to complete task");
    } finally {
      setCompleting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await dispatch(deleteTask(currentTask.id)).unwrap();
      toast.success("Task deleted");
      navigate("/tasks");
    } catch (err) {
      toast.error(err || "Failed to delete task");
      setDeleting(false);
      setShowDelete(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!currentTask && !loading) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate("/tasks")} className="btn-ghost">
          <ArrowBackIcon fontSize="small" /> Back to Tasks
        </button>
        <ErrorAlert message={error || "Task not found"} />
      </div>
    );
  }
  if (!currentTask) return null;

  const statusCfg = STATUS_CONFIG[currentTask.status];
  const priorityCfg = PRIORITY_CONFIG[currentTask.priority];
  const overdue = isOverdue(currentTask.dueDate, currentTask.status);

  return (
    <div className="max-w-3xl animate-fade-in">
      {/* Back link */}
      <button
        onClick={() => navigate("/tasks")}
        className="btn-ghost mb-5 -ml-2"
      >
        <ArrowBackIcon fontSize="small" />
        Back to Tasks
      </button>

      <div className="card overflow-hidden">
        {/* Priority color bar */}
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: priorityCfg.color }}
        />

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={statusCfg.badgeClass}>
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: statusCfg.color }}
                  />
                  {statusCfg.label}
                </span>
                <span className={priorityCfg.badgeClass}>
                  {priorityCfg.icon} {priorityCfg.label} Priority
                </span>
                {overdue && <span className="badge-high">Overdue</span>}
              </div>
              {!isEditing && (
                <h1
                  className={`text-xl sm:text-2xl font-bold leading-tight ${
                    currentTask.status === "DONE"
                      ? "line-through text-slate-400"
                      : "text-slate-900"
                  }`}
                >
                  {currentTask.title}
                </h1>
              )}
            </div>

            {/* Action buttons */}
            {!isEditing && (
              <div className="flex items-center gap-2 shrink-0">
                {currentTask.status !== "DONE" && (
                  <button
                    onClick={handleComplete}
                    disabled={completing || actionLoading}
                    className="btn-secondary text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    title="Mark as complete"
                  >
                    <CheckCircleIcon fontSize="small" />
                    <span className="hidden sm:inline">Complete</span>
                  </button>
                )}
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary"
                >
                  <EditIcon fontSize="small" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => setShowDelete(true)}
                  className="btn-secondary text-red-600 border-red-100 hover:bg-red-50"
                >
                  <DeleteOutlineIcon fontSize="small" />
                </button>
              </div>
            )}
          </div>

          {error && <ErrorAlert message={error} className="mb-4" />}

          {isEditing ? (
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-5">
                Edit Task
              </h2>
              <TaskForm
                task={currentTask}
                onSuccess={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <>
              {/* Description */}
              {currentTask.description && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Description
                  </h3>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {currentTask.description}
                  </p>
                </div>
              )}

              {/* Meta info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                {currentTask.dueDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarTodayIcon
                      fontSize="small"
                      className={overdue ? "text-red-500" : "text-slate-400"}
                    />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">
                        Due Date
                      </p>
                      <p
                        className={`font-medium ${overdue ? "text-red-600" : "text-slate-700"}`}
                      >
                        {formatDate(currentTask.dueDate)}
                        {overdue && " (Overdue)"}
                      </p>
                    </div>
                  </div>
                )}

                {(currentTask.assigneeName || currentTask.assigneeEmail) && (
                  <div className="flex items-center gap-2 text-sm">
                    <PersonOutlineIcon
                      fontSize="small"
                      className="text-slate-400"
                    />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">
                        Assigned To
                      </p>
                      <p className="font-medium text-slate-700">
                        {currentTask.assigneeName || currentTask.assigneeEmail}
                      </p>
                      {currentTask.assigneeName &&
                        currentTask.assigneeEmail && (
                          <p className="text-xs text-slate-500">
                            {currentTask.assigneeEmail}
                          </p>
                        )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <AccessTimeIcon fontSize="small" className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">
                      Created
                    </p>
                    <p className="font-medium text-slate-700">
                      {formatDateTime(currentTask.createdAt)}
                    </p>
                    {currentTask.createdByName && (
                      <p className="text-xs text-slate-500">
                        by {currentTask.createdByName}
                      </p>
                    )}
                  </div>
                </div>

                {currentTask.completedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircleIcon
                      fontSize="small"
                      className="text-emerald-500"
                    />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">
                        Completed
                      </p>
                      <p className="font-medium text-emerald-700">
                        {formatDateTime(currentTask.completedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${currentTask.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        loading={deleting}
      />
    </div>
  );
}
