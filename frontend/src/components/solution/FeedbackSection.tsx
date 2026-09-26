import { useState, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";
import Button from "../ui/Button";
import StarRating from "./StarRating";
import RefinementSection from "./RefinementSection";
import api from "../../services/api";
import type {
  AttemptFeedbackRequest,
  AttemptFeedbackResponse,
  LifeFixSolutionResponse,
} from "../../types";
import "./FeedbackSection.css";

const MAX_COMMENT_CHARS = 1000;

export interface FeedbackSectionProps {
  attemptId: string;
  isRtl?: boolean;
  onRefineSuccess?: (newSolution: LifeFixSolutionResponse) => void;
  onFeedbackSubmitted?: (wasSuccessful: boolean) => void;
  className?: string;
}

type FeedbackStep = "idle" | "yes_form" | "submitted_success" | "submitted_unsuccessful";

export function FeedbackSection({
  attemptId,
  isRtl = false,
  onRefineSuccess,
  onFeedbackSubmitted,
  className = "",
}: FeedbackSectionProps) {
  const [step, setStep] = useState<FeedbackStep>("idle");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backendMessage, setBackendMessage] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<"yes" | "no" | null>(null);

  // 1. User selects "Yes, it solved it"
  const handleYesClick = () => {
    setErrorMessage(null);
    setStep("yes_form");
  };

  // 2. User submits the Yes feedback (with optional rating and optional comment)
  const handleYesSubmit = async (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (isSubmitting || !attemptId) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setLastAction("yes");

    const payload: AttemptFeedbackRequest = {
      was_successful: true,
    };

    if (selectedRating !== null) {
      payload.rating = selectedRating;
    }

    const trimmedComment = commentText.trim();
    if (trimmedComment.length > 0) {
      payload.comment = trimmedComment;
    }

    try {
      const response = await api.post<AttemptFeedbackResponse>(
        `/api/attempts/${attemptId}/feedback`,
        payload
      );
      setBackendMessage(response.data.message);
      setStep("submitted_success");
      onFeedbackSubmitted?.(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setErrorMessage(
            isRtl
              ? "لم يتم العثور على جلسة الحل هذه."
              : "Problem attempt session was not found."
          );
        } else if (err.code === "ERR_NETWORK") {
          setErrorMessage(
            isRtl
              ? "تعذر الاتصال بالخادم. يرجى التحقق من اتصالك والمحاولة مرة أخرى."
              : "Unable to connect to the server. Please check your connection and try again."
          );
        } else {
          setErrorMessage(
            isRtl
              ? "تعذر حفظ التقييم في الوقت الحالي. يرجى المحاولة مرة أخرى."
              : "Something went wrong while recording your feedback. Please try again."
          );
        }
      } else {
        setErrorMessage(
          isRtl
            ? "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."
            : "An unexpected error occurred. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. User selects "No, I still need help"
  const handleNoClick = async () => {
    if (isSubmitting || !attemptId) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setLastAction("no");

    const payload: AttemptFeedbackRequest = {
      was_successful: false,
    };

    try {
      const response = await api.post<AttemptFeedbackResponse>(
        `/api/attempts/${attemptId}/feedback`,
        payload
      );
      setBackendMessage(response.data.message);
      setStep("submitted_unsuccessful");
      onFeedbackSubmitted?.(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setErrorMessage(
            isRtl
              ? "لم يتم العثور على جلسة الحل هذه."
              : "Problem attempt session was not found."
          );
        } else if (err.code === "ERR_NETWORK") {
          setErrorMessage(
            isRtl
              ? "تعذر الاتصال بالخادم. يرجى التحقق من اتصالك والمحاولة مرة أخرى."
              : "Unable to connect to the server. Please check your connection and try again."
          );
        } else {
          setErrorMessage(
            isRtl
              ? "تعذر تسجيل إجابتك. يرجى المحاولة مرة أخرى."
              : "Something went wrong while recording your response. Please try again."
          );
        }
      } else {
        setErrorMessage(
          isRtl
            ? "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."
            : "An unexpected error occurred. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    if (lastAction === "yes") {
      handleYesSubmit();
    } else if (lastAction === "no") {
      handleNoClick();
    }
  };

  const handleCommentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
  };

  return (
    <section
      className={`lifefix-feedback ${isRtl ? "lifefix-feedback--rtl" : ""} ${className}`}
      aria-labelledby="feedback-heading"
    >
      {/* ------------------------------------------------------------------
         State 1: Initial Idle View (Did this solve your problem?)
         ------------------------------------------------------------------ */}
      {step === "idle" && (
        <div className="lifefix-feedback__idle">
          <div className="lifefix-feedback__prompt">
            <h3 id="feedback-heading" className="lifefix-feedback__title">
              {isRtl ? "هل ساعدك هذا الحل في حل مشكلتك؟" : "Did this solve your problem?"}
            </h3>
            <p className="lifefix-feedback__subtitle">
              {isRtl
                ? "أخبرنا إن كانت هذه الخطوات قد ساعدتك في معالجة المشكلة."
                : "Let us know if this guidance helped resolve your issue."}
            </p>
          </div>

          <div className="lifefix-feedback__actions">
            <Button
              type="button"
              variant="success"
              onClick={handleYesClick}
              disabled={isSubmitting}
              leftIcon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              }
            >
              {isRtl ? "نعم، تم حل المشكلة" : "Yes, it solved it"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={handleNoClick}
              disabled={isSubmitting}
              isLoading={isSubmitting && lastAction === "no"}
              leftIcon={
                !isSubmitting && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                )
              }
            >
              {isRtl ? "لا، ما زلت بحاجة إلى مساعدة" : "No, I still need help"}
            </Button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------
         State 2: Yes Selected -> Optional Rating & Comment Form
         ------------------------------------------------------------------ */}
      {step === "yes_form" && (
        <form onSubmit={handleYesSubmit} className="lifefix-feedback__form" noValidate>
          <div className="lifefix-feedback__form-header">
            <div className="lifefix-feedback__success-badge" aria-hidden="true">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h3 id="feedback-heading" className="lifefix-feedback__title">
                {isRtl ? "رائع! يسعدنا سماع ذلك." : "Great! Glad it helped."}
              </h3>
              <p className="lifefix-feedback__subtitle">
                {isRtl
                  ? "يمكنك اختياريًا تقييم هذا الحل أو كتابة تعليق أدناه."
                  : "You can optionally rate this solution or leave a comment below."}
              </p>
            </div>
          </div>

          {/* Optional Star Rating Control */}
          <div className="lifefix-feedback__field">
            <label className="lifefix-feedback__label">
              {isRtl ? "ما مدى رضاك عن هذا الحل؟ (اختياري)" : "How satisfied are you with this solution? (optional)"}
            </label>
            <StarRating
              value={selectedRating}
              onChange={setSelectedRating}
              disabled={isSubmitting}
              isRtl={isRtl}
            />
          </div>

          {/* Optional Comment Field */}
          <div className="lifefix-feedback__field">
            <div className="lifefix-feedback__field-header">
              <label htmlFor="feedback-comment" className="lifefix-feedback__label">
                {isRtl ? "تعليق إضافي (اختياري)" : "Additional comment (optional)"}
              </label>
              <span className="lifefix-feedback__counter" aria-live="polite">
                {commentText.length} / {MAX_COMMENT_CHARS}
              </span>
            </div>
            <textarea
              id="feedback-comment"
              value={commentText}
              onChange={handleCommentChange}
              disabled={isSubmitting}
              maxLength={MAX_COMMENT_CHARS}
              rows={3}
              placeholder={
                isRtl
                  ? "أضف أي تفاصيل حول ما نجح معك أو أي اقتراحات..."
                  : "Share any details about what worked or any suggestions..."
              }
              className="lifefix-feedback__textarea"
            />
          </div>

          {/* Form Actions */}
          <div className="lifefix-feedback__form-actions">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              leftIcon={
                !isSubmitting && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )
              }
            >
              {isSubmitting
                ? isRtl
                  ? "جاري الإرسال..."
                  : "Submitting..."
                : isRtl
                ? "إرسال التقييم"
                : "Submit Feedback"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setStep("idle")}
              disabled={isSubmitting}
            >
              {isRtl ? "رجوع" : "Back"}
            </Button>
          </div>
        </form>
      )}

      {/* ------------------------------------------------------------------
         State 3: Error Notification & Retry Action
         ------------------------------------------------------------------ */}
      {errorMessage && (
        <div className="lifefix-feedback__error" role="alert">
          <div className="lifefix-feedback__error-icon" aria-hidden="true">
            <svg
              width="16"
              height="16"
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
          <div className="lifefix-feedback__error-content">
            <p className="lifefix-feedback__error-message">{errorMessage}</p>
            <button
              type="button"
              onClick={handleRetry}
              disabled={isSubmitting}
              className="lifefix-feedback__retry-btn"
            >
              {isRtl ? "إعادة المحاولة" : "Try again"}
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------
         State 4: Successful Submission Confirmation (Yes flow)
         ------------------------------------------------------------------ */}
      {step === "submitted_success" && (
        <div className="lifefix-feedback__confirmation lifefix-feedback__confirmation--success" role="status">
          <div className="lifefix-feedback__confirm-icon" aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="lifefix-feedback__confirm-content">
            <h4 className="lifefix-feedback__confirm-title">
              {isRtl ? "شكراً لك! تم تسجيل تقييمك." : "Thank you! Your feedback has been recorded."}
            </h4>
            <p className="lifefix-feedback__confirm-desc">
              {backendMessage ||
                (isRtl
                  ? "نحن سعداء بأن هذا الحل ساعد في معالجة المشكلة."
                  : "We're glad LifeFix could help resolve this issue.")}
            </p>
            {selectedRating !== null && (
              <div className="lifefix-feedback__recorded-rating" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className={`lifefix-mini-star ${
                      s <= selectedRating ? "lifefix-mini-star--active" : ""
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------
         State 5: Unsuccessful Acknowledgment Confirmation & Refinement UI
         ------------------------------------------------------------------ */}
      {step === "submitted_unsuccessful" && (
        <div className="lifefix-feedback__unsuccessful-wrapper">
          <div className="lifefix-feedback__confirmation lifefix-feedback__confirmation--note" role="status">
            <div className="lifefix-feedback__confirm-icon lifefix-feedback__confirm-icon--note" aria-hidden="true">
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
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <div className="lifefix-feedback__confirm-content">
              <h4 className="lifefix-feedback__confirm-title">
                {isRtl ? "شكراً لإعلامنا" : "Thank you for letting us know."}
              </h4>
              <p className="lifefix-feedback__confirm-desc">
                {backendMessage ||
                  (isRtl
                    ? "تم تسجيل أن هذا الحل لم يساعد في حل المشكلة. دعنا نحسّن الحل معاً."
                    : "We've recorded that this solution didn't resolve your problem. Let's refine the solution together.")}
              </p>
            </div>
          </div>

          {/* Refinement UI appears only after negative feedback has been successfully recorded */}
          <RefinementSection
            attemptId={attemptId}
            isRtl={isRtl}
            onRefineSuccess={onRefineSuccess}
          />
        </div>
      )}
    </section>
  );
}


export default FeedbackSection;
