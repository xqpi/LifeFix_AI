import {
  useState,
  useRef,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import axios from "axios";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageContainer from "../components/ui/PageContainer";
import LoadingState from "../components/ui/LoadingState";
import ErrorAlert from "../components/ui/ErrorAlert";
import SolutionDocument from "../components/solution/SolutionDocument";
import api from "../services/api";
import type {
  ProblemCategory,
  LifeFixSolutionResponse,
  SolveProblemRequest,
} from "../types";
import "./HomePage.css";

const MAX_PROBLEM_CHARS = 2000;

const SUGGESTED_CATEGORIES: ProblemCategory[] = [
  "Technology",
  "Home & Living",
  "Productivity",
  "Cooking",
  "Everyday Fixes",
];

export function HomePage() {
  const [problemText, setProblemText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProblemCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [solution, setSolution] = useState<LifeFixSolutionResponse | null>(null);
  const [submittedProblem, setSubmittedProblem] = useState("");
  const [attemptNumber, setAttemptNumber] = useState(1);
  // attempt_id preserved in React state for subsequent feedback/refinement workflows
  const [, setAttemptId] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const solutionSectionRef = useRef<HTMLDivElement>(null);

  const trimmedLength = problemText.trim().length;
  const isSubmitDisabled = trimmedLength === 0 || isLoading;

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setProblemText(e.target.value);
  };

  const handleCategoryToggle = (category: ProblemCategory) => {
    if (isLoading) return;
    // Single-select toggle: clicking again deselects it
    setSelectedCategory((prev) => (prev === category ? null : category));
  };

  const handleClearCategory = () => {
    if (isLoading) return;
    setSelectedCategory(null);
  };

  const handleSubmit = async (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const trimmed = problemText.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const payload: SolveProblemRequest = {
      problem_description: trimmed,
      category_hint: selectedCategory || null,
    };

    try {
      const response = await api.post<LifeFixSolutionResponse>("/api/solve", payload);
      setSolution(response.data);
      setAttemptId(response.data.attempt_id);
      setSubmittedProblem(trimmed);
      setAttemptNumber(1);

      // Smoothly transition focus and scroll to the solution document
      setTimeout(() => {
        solutionSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400 || err.response?.status === 422) {
          const detail = err.response.data?.detail;
          let userDetail = "Please enter a valid problem description.";
          if (typeof detail === "string") {
            userDetail = detail;
          } else if (Array.isArray(detail) && detail[0]?.msg) {
            userDetail = String(detail[0].msg).replace(/^Value error,\s*/, "");
          }
          setErrorMessage(userDetail);
        } else if (err.response?.status === 500) {
          setErrorMessage(
            "We encountered an issue processing your problem on the server. Please try again."
          );
        } else if (err.code === "ERR_NETWORK") {
          setErrorMessage(
            "Unable to connect to the LifeFix service. Please ensure the backend server is running."
          );
        } else {
          setErrorMessage(
            "Something went wrong while working through your problem. Please try again."
          );
        }
      } else {
        setErrorMessage(
          "An unexpected error occurred. Your problem description is saved."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSolutionRefined = (newSolution: LifeFixSolutionResponse) => {
    setSolution(newSolution);
    setAttemptId(newSolution.attempt_id);
    setAttemptNumber((prev) => prev + 1);

    setTimeout(() => {
      solutionSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };


  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Cross-platform keyboard shortcut: Ctrl + Enter (Win/Linux) or Cmd + Enter (macOS)
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (!isSubmitDisabled) {
        handleSubmit();
      }
    }
  };

  const handleEditProblem = () => {
    textareaRef.current?.focus();
    textareaRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <PageContainer>
      {/* Screen Reader Live Region for Dynamic Announcements */}
      <div className="sr-only" aria-live="polite">
        {isLoading
          ? "LifeFix is analyzing your problem and preparing guidance."
          : solution
          ? "Solution generated successfully."
          : errorMessage
          ? "A problem occurred while generating the solution."
          : ""}
      </div>

      <div className="lifefix-home">
        {/* Welcome Section */}
        <section className="lifefix-home__hero" aria-labelledby="welcome-heading">
          <Badge variant="primary" className="lifefix-home__badge">
            LifeFix — AI Personal Problem Solver
          </Badge>
          <h1 id="welcome-heading" className="lifefix-home__title">
            {solution ? "Your Personalized Solution" : "Describe what's going wrong."}
          </h1>
          <p className="lifefix-home__subtitle">
            {solution
              ? "Here is the structured step-by-step guidance assembled for your issue."
              : "Explain your issue naturally in your own words. LifeFix will help you understand what's happening and guide you through practical steps to fix it."}
          </p>
        </section>

        {/* Problem Input Experience Card */}
        <Card
          variant="xl"
          className="lifefix-problem-card"
          as="section"
          aria-label="Problem Entry Workspace"
        >
          <form onSubmit={handleSubmit} className="lifefix-problem-form" noValidate>
            <div className="lifefix-problem-form__label-group">
              <label
                htmlFor="problem-description"
                className="lifefix-problem-form__label"
              >
                Your Problem Description
              </label>
            </div>

            <textarea
              id="problem-description"
              name="problem_description"
              ref={textareaRef}
              value={problemText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Tell me what’s going wrong..."
              maxLength={MAX_PROBLEM_CHARS}
              rows={solution ? 3 : 5}
              aria-describedby="problem-helper problem-counter"
              className="lifefix-problem-form__textarea"
              autoComplete="off"
              spellCheck="true"
            />

            <div className="lifefix-problem-form__meta">
              <span id="problem-helper" className="lifefix-problem-form__helper">
                You can describe the problem in your own words.
              </span>
              <span
                id="problem-counter"
                className="lifefix-problem-form__counter"
                aria-live="polite"
              >
                {problemText.length} / {MAX_PROBLEM_CHARS}
              </span>
            </div>

            {/* Category Suggestion Chips */}
            <div
              className="lifefix-categories"
              role="group"
              aria-labelledby="categories-label"
            >
              <div className="lifefix-categories__header">
                <span id="categories-label" className="lifefix-categories__title">
                  Suggested areas (optional):
                </span>
                {selectedCategory && (
                  <button
                    type="button"
                    onClick={handleClearCategory}
                    disabled={isLoading}
                    className="lifefix-categories__clear"
                    aria-label="Clear selected category"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              <div className="lifefix-categories__list">
                {SUGGESTED_CATEGORIES.map((category) => {
                  const isSelected = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryToggle(category)}
                      disabled={isLoading}
                      aria-pressed={isSelected}
                      className={`lifefix-category-chip ${
                        isSelected ? "lifefix-category-chip--selected" : ""
                      }`}
                    >
                      {isSelected && (
                        <span
                          className="lifefix-category-chip__icon"
                          aria-hidden="true"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      )}
                      <span>{category}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="lifefix-problem-form__footer">
              <span className="lifefix-problem-form__hint">
                Press Ctrl + Enter on Windows/Linux; Cmd + Enter on macOS
              </span>

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitDisabled}
                isLoading={isLoading}
                leftIcon={
                  !isLoading ? (
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
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ) : undefined
                }
              >
                {isLoading ? "Solving..." : solution ? "Update Solution" : "Solve Problem"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Error State */}
        {errorMessage && (
          <ErrorAlert
            message={errorMessage}
            onRetry={() => handleSubmit()}
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <LoadingState message="Thinking through your problem..." />
        )}

        {/* Structured Solution Document Display */}
        {solution && (
          <div ref={solutionSectionRef} className="lifefix-home__solution-wrapper">
            <SolutionDocument
              solution={solution}
              originalProblem={submittedProblem}
              attemptNumber={attemptNumber}
              onSolutionRefined={handleSolutionRefined}
              onEditProblem={handleEditProblem}
            />
          </div>
        )}


        {/* Supporting Philosophy Pillars (Visible prior to solution) */}
        {!solution && !isLoading && (
          <section className="lifefix-home__pillars" aria-label="Core Capabilities">
            <div className="lifefix-pillar-card">
              <div className="lifefix-pillar-card__icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h2 className="lifefix-pillar-card__title">Structured Steps</h2>
              <p className="lifefix-pillar-card__description">
                Clear, numbered guidance with estimated time and difficulty ratings instead of walls of chatbot text.
              </p>
            </div>

            <div className="lifefix-pillar-card">
              <div className="lifefix-pillar-card__icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h2 className="lifefix-pillar-card__title">Iterative Refinement</h2>
              <p className="lifefix-pillar-card__description">
                Didn't solve the problem? Provide what happened, and LifeFix will refine the solution chain.
              </p>
            </div>

            <div className="lifefix-pillar-card">
              <div className="lifefix-pillar-card__icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h2 className="lifefix-pillar-card__title">Verified Knowledge</h2>
              <p className="lifefix-pillar-card__description">
                Solutions are grounded in LifeFix verified problem cases using hybrid multilingual semantic search.
              </p>
            </div>
          </section>
        )}
      </div>
    </PageContainer>
  );
}

export default HomePage;
