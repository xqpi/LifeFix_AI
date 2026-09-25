export interface UnderstandingBannerProps {
  understanding: string;
  isRtl?: boolean;
  className?: string;
}

export function UnderstandingBanner({
  understanding,
  isRtl = false,
  className = "",
}: UnderstandingBannerProps) {
  if (!understanding || !understanding.trim()) {
    return null;
  }

  const label = isRtl ? "فهم المشكلة" : "Here's what I understand";

  return (
    <section
      className={`lifefix-understanding-banner ${
        isRtl ? "lifefix-understanding-banner--rtl" : ""
      } ${className}`}
      aria-labelledby="understanding-heading"
    >
      <div className="lifefix-understanding-banner__header">
        <span className="lifefix-understanding-banner__icon" aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </span>
        <h2 id="understanding-heading" className="lifefix-understanding-banner__title">
          {label}
        </h2>
      </div>
      <p className="lifefix-understanding-banner__text">{understanding}</p>
    </section>
  );
}

export default UnderstandingBanner;
