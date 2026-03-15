import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchDashboard } from "../features/tasks/tasksSlice";
import { PageLoader } from "../components/common/LoadingSpinner";
import ErrorAlert from "../components/common/ErrorAlert";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TodayIcon from "@mui/icons-material/Today";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../utils/helpers";

function StatCard({ icon: Icon, label, value, color, bgColor, subtext }) {
  return (
    <div className="card p-5 flex items-start gap-4 animate-slide-up">
      <div
        className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <Icon fontSize="small" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">
          {value ?? "—"}
        </p>
        {subtext && <p className="text-xs text-slate-400 mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-card text-sm">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.fill || entry.color }}>
            {entry.name}: <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { dashboard, loading, error } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (loading && !dashboard) return <PageLoader />;

  const statusData = dashboard
    ? [
        { name: "To Do", value: dashboard.todoCount, fill: STATUS_CONFIG.TODO.color },
        {
          name: "In Progress",
          value: dashboard.inProgressCount,
          fill: STATUS_CONFIG.IN_PROGRESS.color,
        },
        { name: "Done", value: dashboard.doneCount, fill: STATUS_CONFIG.DONE.color },
      ]
    : [];

  const priorityData = dashboard
    ? [
        {
          name: "Low",
          value: dashboard.lowPriorityCount,
          fill: PRIORITY_CONFIG.LOW.color,
        },
        {
          name: "Medium",
          value: dashboard.mediumPriorityCount,
          fill: PRIORITY_CONFIG.MEDIUM.color,
        },
        {
          name: "High",
          value: dashboard.highPriorityCount,
          fill: PRIORITY_CONFIG.HIGH.color,
        },
      ]
    : [];

  const completionRate = dashboard?.totalTasks
    ? Math.round((dashboard.doneCount / dashboard.totalTasks) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Good day, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Here&apos;s your task overview.
          </p>
        </div>
        <Link to="/tasks/new" className="btn-primary shrink-0">
          <AddIcon fontSize="small" />
          New Task
        </Link>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={AssignmentIcon}
          label="Total Tasks"
          value={dashboard?.totalTasks}
          color="#2563eb"
          bgColor="#eff6ff"
        />
        <StatCard
          icon={PendingActionsIcon}
          label="To Do"
          value={dashboard?.todoCount}
          color="#64748b"
          bgColor="#f1f5f9"
        />
        <StatCard
          icon={AutorenewIcon}
          label="In Progress"
          value={dashboard?.inProgressCount}
          color="#2563eb"
          bgColor="#eff6ff"
        />
        <StatCard
          icon={CheckCircleOutlineIcon}
          label="Completed"
          value={dashboard?.doneCount}
          color="#059669"
          bgColor="#ecfdf5"
          subtext={`${completionRate}% completion rate`}
        />
        <StatCard
          icon={WarningAmberIcon}
          label="Overdue"
          value={dashboard?.overdueCount}
          color="#dc2626"
          bgColor="#fef2f2"
        />
        <StatCard
          icon={TodayIcon}
          label="Done Today"
          value={dashboard?.completedTodayCount}
          color="#7c3aed"
          bgColor="#f5f3ff"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            Tasks by Status
          </h2>
          {dashboard?.totalTasks === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              No tasks yet.{" "}
              <Link
                to="/tasks/new"
                className="text-primary-600 ml-1 hover:underline"
              >
                Create one →
              </Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={statusData}
                barSize={40}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            Tasks by Priority
          </h2>
          {dashboard?.totalTasks === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              No tasks yet.{" "}
              <Link
                to="/tasks/new"
                className="text-primary-600 ml-1 hover:underline"
              >
                Create one →
              </Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-slate-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/tasks/new" className="btn-primary">
            <AddIcon fontSize="small" /> Create Task
          </Link>
          <Link to="/tasks?status=IN_PROGRESS" className="btn-secondary">
            <AutorenewIcon fontSize="small" /> View In Progress
          </Link>
          <Link to="/tasks?priority=HIGH" className="btn-secondary">
            <WarningAmberIcon fontSize="small" /> High Priority
          </Link>
          <Link to="/tasks" className="btn-ghost">
            <AssignmentIcon fontSize="small" /> All Tasks →
          </Link>
        </div>
      </div>
    </div>
  );
}
