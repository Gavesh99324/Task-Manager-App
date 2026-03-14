import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { completeTask, deleteTask } from "../../features/tasks/tasksSlice";
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  formatDate,
  isOverdue,
} from "../../utils/helpers";
import ConfirmDialog from "../common/ConfirmDialog";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import toast from "react-hot-toast";

export default function TaskCard({ task, onDeleted }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [completing, setCompleting] = useState(false);

  const statusCfg = STATUS_CONFIG[task.status];
  const priorityCfg = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.dueDate, task.status);
  const formattedDate = formatDate(task.dueDate);

  const handleComplete = async (e) => {
    e.stopPropagation();
    if (task.status === "DONE" || completing) return;
    setCompleting(true);
    try {
      await dispatch(completeTask(task.id)).unwrap();
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
      await dispatch(deleteTask(task.id)).unwrap();
      toast.success("Task deleted");
      setShowDelete(false);
      onDeleted?.();
    } catch (err) {
      toast.error(err || "Failed to delete task");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div
        className="card card-hover cursor-pointer p-4 sm:p-5 animate-slide-up group relative"
        onClick={() => navigate(`/tasks/${task.id}`)}
      >
        <div
          className="absolute top-0 left-0 w-1 h-full rounded-l-xl"
          style={{ backgroundColor: priorityCfg.color }}
        />

        <div className="pl-3">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3
                className={`font-semibold text-slate-900 text-sm sm:text-base leading-snug truncate ${
                  task.status === "DONE" ? "line-through text-slate-400" : ""
                }`}
              >
                {task.title}
              </h3>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              {task.status !== "DONE" && (
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                  title="Mark as complete"
                >
                  <CheckCircleIcon fontSize="small" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/tasks/${task.id}`);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                title="Edit task"
              >
                <EditIcon fontSize="small" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDelete(true);
                }}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                title="Delete task"
              >
                <DeleteOutlineIcon fontSize="small" />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={statusCfg.badgeClass}>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: statusCfg.color }}
              />
              {statusCfg.label}
            </span>
            <span className={priorityCfg.badgeClass}>
              {priorityCfg.icon} {priorityCfg.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {formattedDate && (
              <span
                className={`flex items-center gap-1 ${overdue ? "text-red-600 font-medium" : ""}`}
              >
                <CalendarTodayIcon sx={{ fontSize: 12 }} />
                {overdue ? `Overdue · ${formattedDate}` : formattedDate}
              </span>
            )}
            {task.assigneeName && (
              <span className="flex items-center gap-1">
                <PersonOutlineIcon sx={{ fontSize: 12 }} />
                {task.assigneeName}
              </span>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        loading={deleting}
      />
    </>
  );
}
