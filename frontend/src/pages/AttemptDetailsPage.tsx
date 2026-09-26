import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAttempt } from "../services/api";
import type { AttemptDetailResponse } from "../types";
import PageContainer from "../components/ui/PageContainer";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import UnderstandingBanner from "../components/solution/UnderstandingBanner";
import CausesSection from "../components/solution/CausesSection";
import SolutionSteps from "../components/solution/SolutionSteps";
import WarningCallout from "../components/solution/WarningCallout";
import SourceCases from "../components/solution/SourceCases";
import "../components/solution/SolutionDocument.css";
import "./AttemptDetailsPage.css";

function formatAttemptDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  } catch {
    return isoString;
  }
}

export function AttemptDetailsPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<AttemptDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(attemptId));
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authentication guard: redirect unauthenticated users to login once auth is resolved
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  const isNotFound = notFound || !attemptId;

  useEffect(() => {
    let ignore = false;

    if (isAuthenticated && !isAuthLoading && attemptId) {
      getAttempt(attemptId)
        .then((data) => {
          if (!ignore) {
            setAttempt(data);
            setError(null);
            setNotFound(false);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          if (!ignore) {
            if (err?.response?.status === 404) {
              setNotFound(true);
            } else {
              setError("We couldn't load this attempt. Please check your connection and try again.");
            }
            setIsLoading(false);
          }
        });
    }

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, isAuthLoading, attemptId]);

  const handleRetry = () => {
    if (!attemptId) return;
    setIsLoading(true);
    setError(null);
    setNotFound(false);
    getAttempt(attemptId)
      .then((data) => {
        setAttempt(data);
        setError(null);
        setNotFound(false);
      })
      .catch((err) => {
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          setError("We couldn't load this attempt. Please check your connection and try again.");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Auth initializing: render skeleton layout
  if (isAuthLoading) {
    return (
      <PageContainer className="lifefix-attempt-detail-page">
        <div className="lifefix-attempt-detail__back-nav">
          <div className="lifefix-attempt-skeleton-bar" style={{ width: "120px", height: "24px" }} />
        </div>
        <div className="lifefix-attempt-skeleton-card">
          <div className="lifefix-attempt-skeleton-bar" style={{ width: "200px", height: "32px", marginBottom: "12px" }} />
          <div className="lifefix-attempt-skeleton-bar" style={{ width: "60%", height: "20px" }} />
        </div>
      </PageContainer>
    );
  }

  // Not authenticated: handled by redirect effect; return null
  if (!isAuthenticated) {
    return null;
  }

  // Loading Attempt Details: skeleton layout
  if (isLoading) {
    return (
      <PageContainer className="lifefix-attempt-detail-page">
        <nav className="lifefix-attempt-detail__back-nav" aria-label="Breadcrumb navigation">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/history")}
            disabled
            leftIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            }
          >
            Back to History
          </Button>
        </nav>

        <div className="lifefix-attempt-detail__skeleton-container" aria-label="Loading attempt details" role="status" aria-live="polite">
          {/* Header Skeleton */}
          <div className="lifefix-attempt-skeleton-card">
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              <div className="lifefix-attempt-skeleton-bar" style={{ width: "80px", height: "24px" }} />
              <div className="lifefix-attempt-skeleton-bar" style={{ width: "130px", height: "24px" }} />
            </div>
            <div className="lifefix-attempt-skeleton-bar" style={{ width: "220px", height: "30px", marginBottom: "16px" }} />
            <div className="lifefix-attempt-skeleton-bar" style={{ width: "100%", height: "60px" }} />
          </div>

          {/* Solution Body Skeleton */}
          <div className="lifefix-attempt-skeleton-card">
            <div className="lifefix-attempt-skeleton-bar" style={{ width: "180px", height: "22px", marginBottom: "12px" }} />
            <div className="lifefix-attempt-skeleton-bar" style={{ width: "95%", height: "40px", marginBottom: "24px" }} />
            <div className="lifefix-attempt-skeleton-bar" style={{ width: "100%", height: "80px", marginBottom: "16px" }} />
            <div className="lifefix-attempt-skeleton-bar" style={{ width: "100%", height: "80px" }} />
          </div>
        </div>
      </PageContainer>
    );
  }

  // 404 Not Found State
  if (isNotFound) {
    return (
      <PageContainer className="lifefix-attempt-detail-page">
        <nav className="lifefix-attempt-detail__back-nav" aria-label="Breadcrumb navigation">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/history")}
            leftIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            }
          >
            Back to History
          </Button>
        </nav>

        <div className="lifefix-attempt-detail__empty" role="status" aria-live="polite">
          <div className="lifefix-attempt-detail__empty-icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="lifefix-attempt-detail__empty-title">This attempt could not be found.</h2>
          <p className="lifefix-attempt-detail__empty-desc">
            The requested problem attempt does not exist or you do not have permission to view it.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/history")}
            aria-label="Return to your problem history list"
          >
            Back to History
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Network / Server Error State
  if (error || !attempt) {
    return (
      <PageContainer className="lifefix-attempt-detail-page">
        <nav className="lifefix-attempt-detail__back-nav" aria-label="Breadcrumb navigation">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/history")}
            leftIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            }
          >
            Back to History
          </Button>
        </nav>

        <div className="lifefix-attempt-detail__error" role="alert" aria-live="polite">
          <div className="lifefix-attempt-detail__error-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error || "We couldn't load this attempt."}</span>
          </div>
          <div className="lifefix-attempt-detail__error-actions">
            <Button variant="secondary" size="sm" onClick={handleRetry} aria-label="Retry loading this attempt">
              Try Again
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/history")} aria-label="Back to problem history">
              Back to History
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Detect RTL (Arabic) content in the problem message or solution
  const sampleText = `${attempt.user_message} ${attempt.solution.understanding || ""}`;
  const isRtl = /[\u0600-\u06FF]/.test(sampleText);

  const solution = attempt.solution;
  const validExplanations = (solution.explanations || []).filter(
    (exp) => typeof exp === "string" && exp.trim().length > 0
  );

  return (
    <PageContainer className="lifefix-attempt-detail-page">
      {/* Back to History Navigation */}
      <nav className="lifefix-attempt-detail__back-nav" aria-label="Breadcrumb navigation">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/history")}
          aria-label="Return to problem history list"
          leftIcon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          }
        >
          Back to History
        </Button>
      </nav>

      {/* Main Attempt Detail Card */}
      <article
        className={`lifefix-attempt-detail ${isRtl ? "lifefix-attempt-detail--rtl" : ""}`}
        dir={isRtl ? "rtl" : "ltr"}
        lang={isRtl ? "ar" : "en"}
        aria-label={isRtl ? "تفاصيل المحاولة والحل" : "Attempt Details and Solution"}
      >
        {/* Header: Title, Metadata, Status Badge, Refined Badge */}
        <header className="lifefix-attempt-detail__header">
          <div className="lifefix-attempt-detail__meta-row">
            <div className="lifefix-attempt-detail__badges">
              {/* Status Badge */}
              {attempt.was_successful === true && (
                <Badge variant="success" size="sm">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{isRtl ? "تم الحل" : "Solved"}</span>
                </Badge>
              )}
              {attempt.was_successful === false && (
                <Badge variant="warning" size="sm">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{isRtl ? "لم يتم الحل" : "Unsolved"}</span>
                </Badge>
              )}
              {attempt.was_successful === null && (
                <Badge variant="default" size="sm">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 14 14" />
                  </svg>
                  <span>{isRtl ? "بانتظار التقييم" : "Feedback pending"}</span>
                </Badge>
              )}

              {/* Refinement Badge if applicable */}
              {attempt.parent_attempt_id !== null && (
                <Badge variant="primary" size="sm">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  <span>{isRtl ? "محاولة محسنة" : "Refined attempt"}</span>
                </Badge>
              )}
            </div>

            {/* Timestamp */}
            <time className="lifefix-attempt-detail__timestamp" dateTime={attempt.created_at}>
              {formatAttemptDate(attempt.created_at)}
            </time>
          </div>

          <h1 className="lifefix-attempt-detail__title">
            {isRtl ? "تفاصيل المحاولة" : "Attempt Details"}
          </h1>
        </header>

        {/* Section: Your Problem */}
        <section className="lifefix-attempt-detail__problem-section" aria-labelledby="problem-heading">
          <div className="lifefix-attempt-detail__section-header">
            <span className="lifefix-attempt-detail__section-tag">
              {isRtl ? "المشكلة الأصلية" : "Your Problem"}
            </span>
          </div>
          <p id="problem-heading" className="lifefix-attempt-detail__problem-text">
            {attempt.user_message}
          </p>
        </section>

        {/* Structured Solution Sections */}
        <div className="lifefix-attempt-detail__solution-body">
          {/* 1. Understanding */}
          {solution.understanding && (
            <UnderstandingBanner understanding={solution.understanding} isRtl={isRtl} />
          )}

          {/* 2. Possible Causes */}
          {solution.possible_causes && solution.possible_causes.length > 0 && (
            <CausesSection causes={solution.possible_causes} isRtl={isRtl} />
          )}

          {/* 3. Recommended Action Steps */}
          {solution.recommended_steps && solution.recommended_steps.length > 0 && (
            <SolutionSteps steps={solution.recommended_steps} isRtl={isRtl} />
          )}

          {/* 4. Why This Works / Explanations */}
          {validExplanations.length > 0 && (
            <section className="lifefix-explanations-section" aria-labelledby="explanations-heading">
              <h3 id="explanations-heading" className="lifefix-explanations-section__title">
                {isRtl ? "لماذا يساعد هذا النهج؟" : "Why this approach helps"}
              </h3>
              <ul className="lifefix-explanations-list">
                {validExplanations.map((exp, idx) => (
                  <li key={idx} className="lifefix-explanation-item">
                    <span className="lifefix-explanation-item__check" aria-hidden="true">✓</span>
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 5. Warnings and Notes */}
          {solution.warnings_or_notes && solution.warnings_or_notes.length > 0 && (
            <WarningCallout warnings={solution.warnings_or_notes} isRtl={isRtl} />
          )}

          {/* 6. Clarification / Follow-up Question */}
          {solution.follow_up_question && solution.follow_up_question.trim().length > 0 && (
            <section className="lifefix-followup-callout" aria-labelledby="followup-heading">
              <div className="lifefix-followup-callout__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="lifefix-followup-callout__content">
                <h4 id="followup-heading" className="lifefix-followup-callout__title">
                  {isRtl ? "سؤال للمتابعة" : "Follow-up question"}
                </h4>
                <p className="lifefix-followup-callout__text">{solution.follow_up_question.trim()}</p>
              </div>
            </section>
          )}

          {/* 7. Knowledge Attribution / Verified Cases */}
          {solution.source_cases && solution.source_cases.length > 0 && (
            <SourceCases sources={solution.source_cases} isRtl={isRtl} />
          )}

          {/* 8. Feedback Status Display */}
          <section className="lifefix-attempt-detail__feedback-section" aria-labelledby="feedback-section-title">
            <h3 id="feedback-section-title" className="lifefix-attempt-detail__feedback-title">
              {isRtl ? "حالة الحل" : "Feedback"}
            </h3>
            <div className="lifefix-attempt-detail__feedback-card">
              {attempt.was_successful === true && (
                <div className="lifefix-attempt-detail__feedback-state lifefix-attempt-detail__feedback-state--success">
                  <Badge variant="success" size="md">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{isRtl ? "تم الحل بنجاح" : "Solved"}</span>
                  </Badge>
                  <p className="lifefix-attempt-detail__feedback-text">
                    {isRtl
                      ? "تم تأكيد نجاح هذا الحل في حل المشكلة."
                      : "This problem was confirmed as successfully resolved with this solution."}
                  </p>
                </div>
              )}
              {attempt.was_successful === false && (
                <div className="lifefix-attempt-detail__feedback-state lifefix-attempt-detail__feedback-state--warning">
                  <Badge variant="warning" size="md">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{isRtl ? "لم يتم الحل" : "Unsolved"}</span>
                  </Badge>
                  <p className="lifefix-attempt-detail__feedback-text">
                    {isRtl
                      ? "أشار التقييم إلى أن هذا الحل لم يحل المشكلة بالكامل."
                      : "This solution did not fully resolve the problem."}
                  </p>
                </div>
              )}
              {attempt.was_successful === null && (
                <div className="lifefix-attempt-detail__feedback-state lifefix-attempt-detail__feedback-state--pending">
                  <Badge variant="default" size="md">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 14 14" />
                    </svg>
                    <span>{isRtl ? "بانتظار التقييم" : "Feedback pending"}</span>
                  </Badge>
                  <p className="lifefix-attempt-detail__feedback-text">
                    {isRtl
                      ? "لم يتم تسجيل تقييم نهائي بعد لهذه المحاولة."
                      : "No resolution feedback was recorded for this attempt."}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <footer className="lifefix-attempt-detail__footer">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate("/history")}
            aria-label="Return to problem history list"
            leftIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            }
          >
            Back to History
          </Button>
        </footer>
      </article>
    </PageContainer>
  );
}

export default AttemptDetailsPage;
