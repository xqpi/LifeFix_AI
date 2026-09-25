import type { LifeFixSolutionResponse } from "../../types";
import UnderstandingBanner from "./UnderstandingBanner";
import CausesSection from "./CausesSection";
import SolutionSteps from "./SolutionSteps";
import WarningCallout from "./WarningCallout";
import SourceCases from "./SourceCases";
import FeedbackSection from "./FeedbackSection";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import "./SolutionDocument.css";

export interface SolutionDocumentProps {
  solution: LifeFixSolutionResponse;
  originalProblem?: string;
  attemptNumber?: number;
  onSolutionRefined?: (newSolution: LifeFixSolutionResponse) => void;
  onEditProblem?: () => void;
  className?: string;
}

export function SolutionDocument({
  solution,
  originalProblem,
  attemptNumber = 1,
  onSolutionRefined,
  onEditProblem,
  className = "",
}: SolutionDocumentProps) {
  // Detect Arabic content to set appropriate direction and typography
  const sampleText = `${solution.understanding} ${
    solution.recommended_steps[0]?.instruction ?? ""
  }`;
  const isRtl = /[\u0600-\u06FF]/.test(sampleText);

  return (
    <article
      className={`lifefix-solution-doc ${
        isRtl ? "lifefix-solution-doc--rtl" : ""
      } ${className}`}
      dir={isRtl ? "rtl" : "ltr"}
      lang={isRtl ? "ar" : "en"}
      aria-label={isRtl ? "وثيقة الحل الموصى به" : "Recommended Solution Document"}
    >
      {/* Problem Reference / Breadcrumb Header */}
      {originalProblem && (
        <header className="lifefix-solution-doc__header">
          <div className="lifefix-solution-doc__problem-badge">
            <div className="lifefix-solution-doc__badge-top">
              <span className="lifefix-solution-doc__badge-label">
                {isRtl ? "المشكلة:" : "Your Problem:"}
              </span>
              {attemptNumber > 1 && (
                <Badge variant="primary" size="sm" className="lifefix-solution-doc__lineage-badge">
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
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  <span>
                    {isRtl
                      ? `تحسين الحل · المحاولة ${attemptNumber}`
                      : `Solution refinement · Attempt ${attemptNumber}`}
                  </span>
                </Badge>
              )}
            </div>
            <p className="lifefix-solution-doc__problem-text">{originalProblem}</p>
          </div>


          {onEditProblem && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onEditProblem}
              className="lifefix-solution-doc__edit-btn"
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
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              }
            >
              {isRtl ? "تعديل المشكلة" : "Edit problem"}
            </Button>
          )}
        </header>
      )}

      {/* Main Solution Content Sections */}
      <div className="lifefix-solution-doc__body">
        {/* 1. Understanding Banner */}
        <UnderstandingBanner
          understanding={solution.understanding}
          isRtl={isRtl}
        />

        {/* 2. Possible Causes Module */}
        {solution.possible_causes && solution.possible_causes.length > 0 && (
          <CausesSection causes={solution.possible_causes} isRtl={isRtl} />
        )}

        {/* 3. Recommended Action Steps */}
        <SolutionSteps steps={solution.recommended_steps} isRtl={isRtl} />

        {/* 4. Why This Works / Explanations Section */}
        {solution.explanations && solution.explanations.length > 0 && (
          <section
            className="lifefix-explanations-section"
            aria-labelledby="explanations-heading"
          >
            <h3
              id="explanations-heading"
              className="lifefix-explanations-section__title"
            >
              {isRtl ? "لماذا يساعد هذا النهج؟" : "Why this approach helps"}
            </h3>
            <ul className="lifefix-explanations-list">
              {solution.explanations.map((exp, idx) => (
                <li key={idx} className="lifefix-explanation-item">
                  <span
                    className="lifefix-explanation-item__check"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <span>{exp}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 5. Warnings and Notes Callout */}
        {solution.warnings_or_notes && solution.warnings_or_notes.length > 0 && (
          <WarningCallout warnings={solution.warnings_or_notes} isRtl={isRtl} />
        )}

        {/* 6. Clarification / Follow-up Question if provided */}
        {solution.follow_up_question && (
          <section
            className="lifefix-followup-callout"
            aria-labelledby="followup-heading"
          >
            <div className="lifefix-followup-callout__icon" aria-hidden="true">
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
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="lifefix-followup-callout__content">
              <h4 id="followup-heading" className="lifefix-followup-callout__title">
                {isRtl ? "سؤال للمتابعة" : "Follow-up question"}
              </h4>
              <p className="lifefix-followup-callout__text">
                {solution.follow_up_question}
              </p>
            </div>
          </section>
        )}

        {/* 7. Knowledge Attribution / Verified Cases */}
        {solution.source_cases && solution.source_cases.length > 0 && (
          <SourceCases sources={solution.source_cases} isRtl={isRtl} />
        )}

        {/* 8. Solution Feedback & Refinement Loop (DESIGN.md Section 12 & 13) */}
        {solution.attempt_id && (
          <FeedbackSection
            key={solution.attempt_id}
            attemptId={solution.attempt_id}
            isRtl={isRtl}
            onRefineSuccess={onSolutionRefined}
          />
        )}

      </div>
    </article>
  );
}


export default SolutionDocument;
