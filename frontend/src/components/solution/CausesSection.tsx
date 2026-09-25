export interface CausesSectionProps {
  causes: string[];
  isRtl?: boolean;
  className?: string;
}

export function CausesSection({
  causes,
  isRtl = false,
  className = "",
}: CausesSectionProps) {
  if (!causes || causes.length === 0) {
    return null;
  }

  const title = isRtl ? "الأسباب المحتملة" : "Possible Causes";

  return (
    <section
      className={`lifefix-causes-section ${
        isRtl ? "lifefix-causes-section--rtl" : ""
      } ${className}`}
      aria-labelledby="causes-heading"
    >
      <h3 id="causes-heading" className="lifefix-causes-section__title">
        {title}
      </h3>

      <ul className="lifefix-causes-list">
        {causes.map((cause, index) => (
          <li key={index} className="lifefix-cause-item">
            <span className="lifefix-cause-item__bullet" aria-hidden="true">
              •
            </span>
            <span className="lifefix-cause-item__text">{cause}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default CausesSection;
