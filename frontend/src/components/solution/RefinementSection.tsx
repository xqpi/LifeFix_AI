import {
  useState,
  useRef,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import axios from "axios";
import Button from "../ui/Button";
import api from "../../services/api";
import type { LifeFixSolutionResponse, RefineProblemRequest } from "../../types";
import "./RefinementSection.css";

const MAX_REFINEMENT_CHARS = 2000;

export interface RefinementSectionProps {
  attemptId: string;
  isRtl?: boolean;
  onRefineSuccess?: (newSolution: LifeFixSolutionResponse) => void;
  className?: string;
}

export function RefinementSection({
  attemptId,
  isRtl = false,
  onRefineSuccess,
  className = "",
}: RefinementSectionProps) {
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmedLength = additionalInfo.trim().length;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setAdditionalInfo(e.target.value);
    if (validationError && e.target.value.trim().length > 0) {
      setValidationError(null);
    }
  };

  const handleSubmit = async (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const clean = additionalInfo.trim();
    if (!clean) {
      setValidationError(
        isRtl
          ? "يرجى توضيح ما حدث أو إضافة معلومات لم تذكرها من قبل."
          : "Please describe what happened or add details you didn't mention before."
      );
      textareaRef.current?.focus();
      return;
    }

    if (isSubmitting || !attemptId) {
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);
    setErrorMessage(null);

    const payload: RefineProblemRequest = {
      additional_information: clean,
    };

    try {
      const response = await api.post<LifeFixSolutionResponse>(
        `/api/attempts/${attemptId}/refine`,
        payload
      );
      onRefineSuccess?.(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setErrorMessage(
            isRtl
              ? "لم يتم العثور على جلسة الحل السابقة."
              : "Previous problem attempt session was not found."
          );
        } else if (err.response?.status === 400 || err.response?.status === 422) {
          const detail = err.response.data?.detail;
          let userDetail = isRtl
            ? "يرجى تقديم تفاصيل إضافية صالحة."
            : "Please enter valid additional details.";
          if (typeof detail === "string") {
            userDetail = detail;
          } else if (Array.isArray(detail) && detail[0]?.msg) {
            userDetail = String(detail[0].msg).replace(/^Value error,\s*/, "");
          }
          setErrorMessage(userDetail);
        } else if (err.code === "ERR_NETWORK") {
          setErrorMessage(
            isRtl
              ? "تعذر الاتصال بالخادم. يرجى التحقق من اتصالك والمحاولة مرة أخرى."
              : "Unable to connect to the server. Please check your connection and try again."
          );
        } else {
          setErrorMessage(
            isRtl
              ? "حدث خطأ أثناء تحسين الحل. تم حفظ ما كتبته، يرجى المحاولة مرة أخرى."
              : "Something went wrong while refining the solution. Your input is saved, please try again."
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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl + Enter or Cmd + Enter shortcut to trigger refinement
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={`lifefix-refinement ${
        isRtl ? "lifefix-refinement--rtl" : ""
      } ${className}`}
      aria-labelledby="refinement-title"
    >
      <div className="lifefix-refinement__header">
        <div className="lifefix-refinement__icon" aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 21h5v-5" />
          </svg>
        </div>
        <div className="lifefix-refinement__titles">
          <h3 id="refinement-title" className="lifefix-refinement__title">
            {isRtl ? "لنحسّن الحل" : "Let's refine the solution"}
          </h3>
          <p className="lifefix-refinement__subtitle">
            {isRtl
              ? "أخبرني بما حدث عند تجربة الخطوات، أو أضف أي معلومات لم تذكرها من قبل."
              : "Tell me what happened when you tried the steps, or add anything you didn't mention before."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="lifefix-refinement__form" noValidate>
        <div className="lifefix-refinement__field">
          <div className="lifefix-refinement__field-header">
            <label
              htmlFor="refinement-additional-info"
              className="lifefix-refinement__label"
            >
              {isRtl ? "تفاصيل إضافية أو ما حدث" : "What happened / Additional details"}
            </label>
            <span
              id="refinement-counter"
              className="lifefix-refinement__counter"
              aria-live="polite"
            >
              {additionalInfo.length} / {MAX_REFINEMENT_CHARS}
            </span>
          </div>

          <textarea
            id="refinement-additional-info"
            ref={textareaRef}
            value={additionalInfo}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
            maxLength={MAX_REFINEMENT_CHARS}
            rows={4}
            placeholder={
              isRtl
                ? "ماذا حدث عند تجربة الحل؟"
                : "What happened when you tried the solution?"
            }
            aria-invalid={!!validationError}
            aria-describedby={
              validationError
                ? "refinement-validation"
                : "refinement-counter"
            }
            className={`lifefix-refinement__textarea ${
              validationError ? "lifefix-refinement__textarea--error" : ""
            }`}
          />

          {validationError && (
            <p
              id="refinement-validation"
              className="lifefix-refinement__validation-msg"
              role="alert"
            >
              {validationError}
            </p>
          )}
        </div>

        {/* Error notification and retry */}
        {errorMessage && (
          <div className="lifefix-refinement__error" role="alert">
            <div className="lifefix-refinement__error-icon" aria-hidden="true">
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
            <div className="lifefix-refinement__error-content">
              <p className="lifefix-refinement__error-text">{errorMessage}</p>
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="lifefix-refinement__retry-btn"
              >
                {isRtl ? "إعادة المحاولة" : "Try again"}
              </button>
            </div>
          </div>
        )}

        <div className="lifefix-refinement__footer">
          <span className="lifefix-refinement__hint">
            {isRtl
              ? "اضغط Ctrl + Enter أو Cmd + Enter للتحسين"
              : "Press Ctrl + Enter or Cmd + Enter to refine"}
          </span>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || trimmedLength === 0}
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
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              )
            }
          >
            {isSubmitting
              ? isRtl
                ? "جاري تحسين الحل..."
                : "Refining solution..."
              : isRtl
              ? "تحسين الحل"
              : "Refine Solution"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default RefinementSection;
