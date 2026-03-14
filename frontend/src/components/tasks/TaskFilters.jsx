import { useDispatch } from "react-redux";
import { setFilters } from "../../features/tasks/tasksSlice";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

const PRIORITY_OPTIONS = [
  { value: "", label: "All Priorities" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Created Date" },
  { value: "dueDate", label: "Due Date" },
  { value: "priority", label: "Priority" },
];

export default function TaskFilters({ filters }) {
  const dispatch = useDispatch();

  const handleChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <FilterListIcon fontSize="small" className="text-slate-400" />
        <span className="text-sm font-semibold text-slate-700">
          Filter & Sort
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <div className="relative sm:col-span-2">
          <SearchIcon
            fontSize="small"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            placeholder="Search by title…"
            className="input-field pl-9"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => handleChange("status", e.target.value)}
          className="input-field"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => handleChange("priority", e.target.value)}
          className="input-field"
        >
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <select
            value={filters.sortBy}
            onChange={(e) => handleChange("sortBy", e.target.value)}
            className="input-field flex-1"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() =>
              handleChange(
                "sortDir",
                filters.sortDir === "asc" ? "desc" : "asc",
              )
            }
            className="btn-secondary px-3 shrink-0"
            title={`Sort ${filters.sortDir === "asc" ? "descending" : "ascending"}`}
          >
            {filters.sortDir === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      <div className="mt-3">
        <input
          type="email"
          value={filters.assigneeEmail}
          onChange={(e) => handleChange("assigneeEmail", e.target.value)}
          placeholder="Filter by assignee email…"
          className="input-field max-w-xs"
        />
      </div>
    </div>
  );
}
