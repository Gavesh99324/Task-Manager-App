import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function ErrorAlert({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 animate-fade-in">
      <ErrorOutlineIcon fontSize="small" className="shrink-0 mt-0.5" />
      <p className="text-sm flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 text-red-400 hover:text-red-600 transition-colors text-lg leading-none font-bold ml-2"
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  );
}
