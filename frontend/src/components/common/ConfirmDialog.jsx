import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LoadingSpinner from "./LoadingSpinner";

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
  danger = true,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!loading ? onCancel : undefined}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up p-6">
        <div className="flex items-start gap-4">
          {danger && (
            <div className="shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <WarningAmberIcon className="text-red-600" fontSize="small" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={danger ? "btn-danger" : "btn-primary"}
          >
            {loading ? <LoadingSpinner size="sm" /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
