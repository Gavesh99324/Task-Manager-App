import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";

export const STATUS_CONFIG = {
  TODO: {
    label: "To Do",
    badgeClass: "badge-todo",
    color: "#64748b",
    bgColor: "#f1f5f9",
  },
  IN_PROGRESS: {
    label: "In Progress",
    badgeClass: "badge-in-progress",
    color: "#2563eb",
    bgColor: "#eff6ff",
  },
  DONE: {
    label: "Done",
    badgeClass: "badge-done",
    color: "#059669",
    bgColor: "#ecfdf5",
  },
};

export const PRIORITY_CONFIG = {
  LOW: {
    label: "Low",
    badgeClass: "badge-low",
    color: "#64748b",
    icon: "↓",
    order: 1,
  },
  MEDIUM: {
    label: "Medium",
    badgeClass: "badge-medium",
    color: "#d97706",
    icon: "→",
    order: 2,
  },
  HIGH: {
    label: "High",
    badgeClass: "badge-high",
    color: "#dc2626",
    icon: "↑",
    order: 3,
  },
};

export const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d, yyyy");
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return null;
  try {
    const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    return format(date, "MMM d, yyyy HH:mm");
  } catch {
    return dateStr;
  }
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === "DONE") return false;
  try {
    const date = typeof dueDate === "string" ? parseISO(dueDate) : dueDate;
    return isPast(date) && !isToday(date);
  } catch {
    return false;
  }
};

export const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export const truncate = (str, maxLength = 100) => {
  if (!str) return "";
  return str.length > maxLength ? `${str.slice(0, maxLength)}…` : str;
};
