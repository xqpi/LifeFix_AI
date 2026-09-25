import type { LifeFixSourceCase } from "../../types";

export interface SourceCasesProps {
  sources: LifeFixSourceCase[];
  isRtl?: boolean;
  className?: string;
}

export function SourceCases({
  sources,
  isRtl = false,
  className = "",
}: SourceCasesProps) {
  const validSources = sources
    ? sources.filter((s) => s && s.title && s.title.trim().length > 0)
    : [];
  if (validSources.length === 0) {
    return null;
  }

  const title = isRtl
    ? "مستند إلى حالات سابقة مشابهة في LifeFix"
    : "Based on similar LifeFix cases";

  return (
    <section
      className={`lifefix-source-cases ${
        isRtl ? "lifefix-source-cases--rtl" : ""
      } ${className}`}
      aria-labelledby="sources-heading"
    >
      <div className="lifefix-source-cases__header">
        <span className="lifefix-source-cases__icon" aria-hidden="true">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
          </svg>
        </span>
        <h4 id="sources-heading" className="lifefix-source-cases__title">
          {title}
        </h4>
      </div>

      <div className="lifefix-source-cases__list">
        {validSources.map((item, idx) => {
          // Format ID cleanly (short 8-char prefix if UUID)
          const shortId = item.problem_id.length > 8 ? item.problem_id.slice(0, 8) : item.problem_id;

          return (
            <div
              key={`${item.problem_id}-${idx}`}
              className="lifefix-source-pill"
              title={item.title}
            >
              <span className="lifefix-source-pill__id">#{shortId}</span>
              <span className="lifefix-source-pill__title">{item.title}</span>
            </div>
          );
        })}
      </div>
    </section>
  );

}

export default SourceCases;
