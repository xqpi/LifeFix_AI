import Badge from "../ui/Badge";
import type { BadgeVariant, LifeFixSolutionStep } from "../../types";

export interface SolutionStepsProps {
  steps: LifeFixSolutionStep[];
  isRtl?: boolean;
  className?: string;
}

function getDifficultyVariant(difficulty: string): BadgeVariant {
  const norm = difficulty.toLowerCase().trim();
  if (norm.includes("easy") || norm.includes("سهل") || norm.includes("سهلة")) {
    return "success";
  }
  if (norm.includes("medium") || norm.includes("متوسط") || norm.includes("متوسطة")) {
    return "warning";
  }
  if (norm.includes("hard") || norm.includes("صعب") || norm.includes("صعبة")) {
    return "error";
  }
  return "default";
}

function formatDifficultyLabel(difficulty: string, isRtl: boolean): string {
  const norm = difficulty.toLowerCase().trim();
  if (norm.includes("easy") || norm.includes("سهل")) return isRtl ? "سهل" : "Easy";
  if (norm.includes("medium") || norm.includes("متوسط")) return isRtl ? "متوسط" : "Medium";
  if (norm.includes("hard") || norm.includes("صعب")) return isRtl ? "صعب" : "Hard";
  return difficulty;
}

export function SolutionSteps({
  steps,
  isRtl = false,
  className = "",
}: SolutionStepsProps) {
  if (!steps || steps.length === 0) {
    return null;
  }

  const sectionTitle = isRtl ? "الخطوات العملية الموصى بها" : "Recommended Action Steps";

  return (
    <section
      className={`lifefix-solution-steps ${
        isRtl ? "lifefix-solution-steps--rtl" : ""
      } ${className}`}
      aria-labelledby="steps-heading"
    >
      <h3 id="steps-heading" className="lifefix-solution-steps__title">
        {sectionTitle}
      </h3>

      <ol className="lifefix-steps-list">
        {steps.map((step) => {
          const diffVariant = getDifficultyVariant(step.difficulty);
          const diffLabel = formatDifficultyLabel(step.difficulty, isRtl);
          const timeText = isRtl
            ? `${step.estimated_time_minutes} دقيقة`
            : `~${step.estimated_time_minutes} min`;

          return (
            <li key={step.step_number} className="lifefix-step-card">
              <div className="lifefix-step-card__header">
                <div className="lifefix-step-card__badge" aria-hidden="true">
                  {step.step_number}
                </div>

                <div className="lifefix-step-card__title-group">
                  <h4 className="lifefix-step-card__title">{step.title}</h4>

                  <div className="lifefix-step-card__tags">
                    <Badge variant={diffVariant} size="sm">
                      {diffLabel}
                    </Badge>

                    {step.estimated_time_minutes > 0 && (
                      <Badge variant="default" size="sm" className="lifefix-step-card__time-badge">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{timeText}</span>
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="lifefix-step-card__instruction">
                {step.instruction}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default SolutionSteps;
