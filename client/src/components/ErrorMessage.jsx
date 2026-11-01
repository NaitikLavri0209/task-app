export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="error" role="alert">
      <span>⚠ {message}</span>
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  );
}
