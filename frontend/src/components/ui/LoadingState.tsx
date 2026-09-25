import { useEffect, useState } from "react";
import "./LoadingState.css";

const PROGRESSIVE_MESSAGES = [
  "Analyzing your problem symptoms...",
  "Searching verified LifeFix knowledge cases...",
  "Assembling actionable step-by-step guidance...",
];

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Thinking through your problem...",
  className = "",
}: LoadingStateProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % PROGRESSIVE_MESSAGES.length);
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`lifefix-loading-state ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="lifefix-loading-state__header">
        <div className="lifefix-loading-state__spinner" aria-hidden="true" />
        <div className="lifefix-loading-state__titles">
          <h3 className="lifefix-loading-state__main-title">{message}</h3>
          <p className="lifefix-loading-state__step-text">
            {PROGRESSIVE_MESSAGES[messageIndex]}
          </p>
        </div>
      </div>

      <div className="lifefix-loading-state__skeletons" aria-hidden="true">
        <div className="lifefix-skeleton-card">
          <div className="lifefix-skeleton-card__top">
            <div className="lifefix-skeleton-box lifefix-skeleton-box--badge" />
            <div className="lifefix-skeleton-box lifefix-skeleton-box--title" />
            <div className="lifefix-skeleton-box lifefix-skeleton-box--pill" />
          </div>
          <div className="lifefix-skeleton-box lifefix-skeleton-box--text" />
          <div className="lifefix-skeleton-box lifefix-skeleton-box--text-short" />
        </div>

        <div className="lifefix-skeleton-card">
          <div className="lifefix-skeleton-card__top">
            <div className="lifefix-skeleton-box lifefix-skeleton-box--badge" />
            <div className="lifefix-skeleton-box lifefix-skeleton-box--title" />
            <div className="lifefix-skeleton-box lifefix-skeleton-box--pill" />
          </div>
          <div className="lifefix-skeleton-box lifefix-skeleton-box--text" />
          <div className="lifefix-skeleton-box lifefix-skeleton-box--text-short" />
        </div>

        <div className="lifefix-skeleton-card">
          <div className="lifefix-skeleton-card__top">
            <div className="lifefix-skeleton-box lifefix-skeleton-box--badge" />
            <div className="lifefix-skeleton-box lifefix-skeleton-box--title" />
            <div className="lifefix-skeleton-box lifefix-skeleton-box--pill" />
          </div>
          <div className="lifefix-skeleton-box lifefix-skeleton-box--text" />
        </div>
      </div>
    </div>
  );
}

export default LoadingState;
