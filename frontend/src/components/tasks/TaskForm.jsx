import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createTask, updateTask } from "../../features/tasks/tasksSlice";
import { STATUS_OPTIONS, PRIORITY_OPTIONS, EMAIL_REGEX } from "../../utils/helpers";
import ErrorAlert from "../common/ErrorAlert";
import LoadingSpinner from "../common/LoadingSpinner";
import toast from "react-hot-toast";

const MAX_TITLE_LENGTH = 255;

const DEFAULT_FORM = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  dueDate: "",
  assigneeEmail: "",
  assigneeName: "",
};

export default function TaskForm({ task = null, onSuccess }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { actionLoading } = useSelector((state) => state.tasks);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  const isEditing = Boolean(task);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "TODO",
        priority: task.priority || "MEDIUM",
        dueDate: task.dueDate || "",
        assigneeEmail: task.assigneeEmail || "",
        assigneeName: task.assigneeName || "",
      });
    }
  }, [task]);

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    else if (form.title.length > MAX_TITLE_LENGTH)
      newErrors.title = `Title must not exceed ${MAX_TITLE_LENGTH} characters`;
    if (form.assigneeEmail && !EMAIL_REGEX.test(form.assigneeEmail)) {
      newErrors.assigneeEmail = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    const payload = {
      ...form,
      dueDate: form.dueDate || null,
      assigneeEmail: form.assigneeEmail || null,
      assigneeName: form.assigneeName || null,
      description: form.description || null,
    };

    try {
      if (isEditing) {
        await dispatch(updateTask({ id: task.id, data: payload })).unwrap();
        toast.success("Task updated successfully!");
        onSuccess?.();
      } else {
        await dispatch(createTask(payload)).unwrap();
        toast.success("Task created successfully!");
        navigate("/tasks");
      }
    } catch (err) {
      setSubmitError(err || "Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {submitError && (
        <ErrorAlert
          message={submitError}
          onDismiss={() => setSubmitError(null)}
        />
      )}

      <div>
        <label className="input-label" htmlFor="title">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter task title…"
          className={`input-field ${errors.title ? "border-red-300 focus:ring-red-400" : ""}`}
          maxLength={MAX_TITLE_LENGTH}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-600">{errors.title}</p>
        )}
      </div>

      <div>
        <label className="input-label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Add a description…"
          rows={4}
          className="input-field resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="input-label" htmlFor="status">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className="input-field"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="input-label" htmlFor="priority">
            Priority <span className="text-red-500">*</span>
          </label>
          <select
            id="priority"
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="input-field"
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="input-label" htmlFor="dueDate">
          Due Date
        </label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          value={form.dueDate}
          onChange={handleChange}
          className="input-field"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="input-label" htmlFor="assigneeName">
            Assignee Name
          </label>
          <input
            id="assigneeName"
            name="assigneeName"
            type="text"
            value={form.assigneeName}
            onChange={handleChange}
            placeholder="Full name…"
            className="input-field"
          />
        </div>
        <div>
          <label className="input-label" htmlFor="assigneeEmail">
            Assignee Email
          </label>
          <input
            id="assigneeEmail"
            name="assigneeEmail"
            type="email"
            value={form.assigneeEmail}
            onChange={handleChange}
            placeholder="email@example.com"
            className={`input-field ${errors.assigneeEmail ? "border-red-300 focus:ring-red-400" : ""}`}
          />
          {errors.assigneeEmail && (
            <p className="mt-1 text-xs text-red-600">{errors.assigneeEmail}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit"
          disabled={actionLoading}
          className="btn-primary flex-1 sm:flex-none justify-center"
        >
          {actionLoading ? (
            <>
              <LoadingSpinner size="sm" />
              {isEditing ? "Saving…" : "Creating…"}
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Create Task"
          )}
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-secondary flex-1 sm:flex-none justify-center"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
