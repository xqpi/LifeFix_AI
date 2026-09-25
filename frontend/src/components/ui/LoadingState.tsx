import { useEffect, useState } from "react";
import "./LoadingState.css";

const PROGRESSIVE_MESSAGES_EN = [
  "Understanding your problem...",
  "Searching verified LifeFix knowledge cases...",
  "Assembling actionable step-by-step guidance...",
];

const PROGRESSIVE_MESSAGES_AR = [
  "فهم تفاصيل المشكلة...",
  "البحث في حالات المعرفة المعتمدة...",
  "تجميع خطوات عملية لحل المشكلة...",
];

export interface LoadingStateProps {
  message?: string;
  isRtl?: boolean;
  className?: string;
}

export function LoadingState({
  message,
  isRtl = false,
  className = "",
}: LoadingStateProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = isRtl ? PROGRESSIVE_MESSAGES_AR : PROGRESSIVE_MESSAGES_EN;
  const defaultTitle = isRtl ? "جاري التفكير في المشكلة..." : "Thinking through your problem...";
  const displayTitle = message || defaultTitle;

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2400);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div
      className={`lifefix-loading-state ${isRtl ? "lifefix-loading-state--rtl" : ""} ${className}`}
      dir={isRtl ? "rtl" : "ltr"}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="lifefix-loading-state__header">
        <div className="lifefix-loading-state__spinner" aria-hidden="true" />
        <div className="lifefix-loading-state__titles">
          <h3 className="lifefix-loading-state__main-title">{displayTitle}</h3>
          <p className="lifefix-loading-state__step-text">
            {messages[messageIndex]}
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
