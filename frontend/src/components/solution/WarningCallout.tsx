export interface WarningCalloutProps {
  warnings: string[];
  isRtl?: boolean;
  className?: string;
}

export function WarningCallout({
  warnings,
  isRtl = false,
  className = "",
}: WarningCalloutProps) {
  const validWarnings = warnings ? warnings.filter((w) => w && w.trim().length > 0) : [];
  if (validWarnings.length === 0) {
    return null;
  }

  const title = isRtl ? "تنبيهات وملاحظات هامة" : "Important Notes & Warnings";

  return (
    <aside
      className={`lifefix-warning-callout ${
        isRtl ? "lifefix-warning-callout--rtl" : ""
      } ${className}`}
      aria-labelledby="warnings-heading"
    >
      <div className="lifefix-warning-callout__icon" aria-hidden="true">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      <div className="lifefix-warning-callout__content">
        <h4 id="warnings-heading" className="lifefix-warning-callout__title">
          {title}
        </h4>
        <ul className="lifefix-warning-callout__list">
          {validWarnings.map((warning, index) => (
            <li key={index} className="lifefix-warning-callout__item">
              {warning}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}


export default WarningCallout;
