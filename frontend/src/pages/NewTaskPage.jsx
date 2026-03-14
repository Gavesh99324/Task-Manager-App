import { useNavigate } from "react-router-dom";
import TaskForm from "../components/tasks/TaskForm";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function NewTaskPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl animate-fade-in">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-5 -ml-2">
        <ArrowBackIcon fontSize="small" />
        Back
      </button>

      <div className="card p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Create New Task</h1>
          <p className="text-slate-500 text-sm mt-1">
            Fill out the details below to create a new task.
          </p>
        </div>
        <TaskForm />
      </div>
    </div>
  );
}
