import Button from "./Button";
import "./ErrorAlert.css";

export interface ErrorAlertProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorAlert({
  message = "Something went wrong while working through your problem.",
  onRetry,
  className = "",
}: ErrorAlertProps) {
  return (
    <div
      className={`lifefix-error-alert ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="lifefix-error-alert__icon" aria-hidden="true">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <div className="lifefix-error-alert__content">
        <h3 className="lifefix-error-alert__title">Connection issue</h3>
        <p className="lifefix-error-alert__message">{message}</p>
        <p className="lifefix-error-alert__subtext">
          Your problem description is saved. You can try submitting it again.
        </p>

        {onRetry && (
          <div className="lifefix-error-alert__actions">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onRetry}
              leftIcon={
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              }
            >
              Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ErrorAlert;
