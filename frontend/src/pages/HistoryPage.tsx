import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAttemptHistory } from "../services/api";
import type { AttemptHistoryItem } from "../types";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import PageContainer from "../components/ui/PageContainer";
import "./HistoryPage.css";

const PAGE_SIZE = 20;

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

export function HistoryPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AttemptHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication guard: redirect guests to login, avoid flicker while auth initializes
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  useEffect(() => {
    let ignore = false;

    if (isAuthenticated && !isAuthLoading) {
      getAttemptHistory(page, PAGE_SIZE)
        .then((data) => {
          if (!ignore) {
            setItems(data.items);
            setPage(data.page);
            setTotal(data.total);
            setHasNext(data.has_next);
            setError(null);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (!ignore) {
            setError("Unable to load your problem history. Please check your connection and try again.");
            setIsLoading(false);
          }
        });
    }

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, isAuthLoading, page]);

  const handlePageChange = (newPage: number) => {
    if (isLoading || newPage === page) return;
    setIsLoading(true);
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    getAttemptHistory(page, PAGE_SIZE)
      .then((data) => {
        setItems(data.items);
        setPage(data.page);
        setTotal(data.total);
        setHasNext(data.has_next);
        setError(null);
      })
      .catch(() => {
        setError("Unable to load your problem history. Please check your connection and try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // If session is still initializing, render clean skeleton layout
  if (isAuthLoading) {
    return (
      <PageContainer className="lifefix-history-page">
        <header className="lifefix-history-header">
          <div className="lifefix-history-skeleton-bar" style={{ width: "240px", height: "32px", marginBottom: "8px" }} />
          <div className="lifefix-history-skeleton-bar" style={{ width: "360px", height: "18px" }} />
        </header>
        <div className="lifefix-history-list" aria-label="Loading history" role="status">
          {[1, 2, 3].map((skeletonId) => (
            <div key={skeletonId} className="lifefix-history-skeleton-card">
              <div className="lifefix-history-skeleton-bar" style={{ width: "160px", height: "20px" }} />
              <div className="lifefix-history-skeleton-bar" style={{ width: "100%", height: "24px" }} />
              <div className="lifefix-history-skeleton-bar" style={{ width: "80%", height: "16px" }} />
            </div>
          ))}
        </div>
      </PageContainer>
    );
  }

  // If unauthenticated, component redirects via useEffect; return null
  if (!isAuthenticated) {
    return null;
  }

  return (
    <PageContainer className="lifefix-history-page">
      {/* Page Header */}
      <header className="lifefix-history-header">
        <div className="lifefix-history-header__top">
          <h1 className="lifefix-history-title">Problem History</h1>
          {!isLoading && total > 0 && (
            <span className="lifefix-history-count-badge">
              {total} {total === 1 ? "problem" : "problems"}
            </span>
          )}
        </div>
        <p className="lifefix-history-subtitle">
          Review your previous problem-solving attempts, solution steps, and refinement history.
        </p>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="lifefix-history-error" role="alert" aria-live="polite">
          <div className="lifefix-history-error__content">
            <svg
              width="18"
              height="18"
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
            <span>{error}</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRetry}
            aria-label="Retry loading problem history"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <div className="lifefix-history-list" aria-label="Loading your problem history" role="status" aria-live="polite">
          {[1, 2, 3].map((skeletonId) => (
            <div key={skeletonId} className="lifefix-history-skeleton-card">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <div className="lifefix-history-skeleton-bar" style={{ width: "140px", height: "20px" }} />
                <div className="lifefix-history-skeleton-bar" style={{ width: "100px", height: "16px" }} />
              </div>
              <div className="lifefix-history-skeleton-bar" style={{ width: "95%", height: "22px" }} />
              <div className="lifefix-history-skeleton-bar" style={{ width: "100%", height: "48px", marginTop: "4px" }} />
            </div>
          ))}
        </div>
      ) : items.length === 0 && !error ? (
        /* Empty State */
        <div className="lifefix-history-empty" role="status" aria-live="polite">
          <div className="lifefix-history-empty__icon-badge" aria-hidden="true">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 14 14" />
            </svg>
          </div>
          <h2 className="lifefix-history-empty__title">You haven&apos;t solved any problems yet</h2>
          <p className="lifefix-history-empty__description">
            Describe any practical challenge on LifeFix to receive step-by-step guidance.
            Your previous attempts and refined solutions will be organized here.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/")}
            aria-label="Navigate to home page to solve a problem"
          >
            Solve a Problem
          </Button>
        </div>
      ) : (
        /* Populated History List */
        <>
          <section className="lifefix-history-list" aria-label="Problem attempts list" aria-live="polite">
            {items.map((item) => (
              <Card as="article" key={item.id} className="lifefix-history-card">
                {/* Card Header: Badges & Timestamp */}
                <div className="lifefix-history-card__header">
                  <div className="lifefix-history-card__badges">
                    {item.was_successful === true && (
                      <Badge variant="success" size="sm">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Solved</span>
                      </Badge>
                    )}
                    {item.was_successful === false && (
                      <Badge variant="warning" size="sm">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>Unsolved</span>
                      </Badge>
                    )}
                    {item.was_successful === null && (
                      <Badge variant="default" size="sm">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 14 14" />
                        </svg>
                        <span>Feedback pending</span>
                      </Badge>
                    )}
                    {item.parent_attempt_id !== null && (
                      <Badge variant="primary" size="sm">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="1 4 1 10 7 10" />
                          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                        </svg>
                        <span>Refined</span>
                      </Badge>
                    )}
                  </div>
                  <time className="lifefix-history-card__time" dateTime={item.created_at}>
                    {formatAttemptDate(item.created_at)}
                  </time>
                </div>

                {/* Card Body: Problem Message */}
                <h2 className="lifefix-history-card__problem">{item.user_message}</h2>

                {/* Solution Preview Snippet (omitted gracefully if null) */}
                {item.solution_preview && (
                  <div className="lifefix-history-card__preview">
                    <span className="lifefix-history-card__preview-label">Solution Preview</span>
                    <p className="lifefix-history-card__preview-text">{item.solution_preview}</p>
                  </div>
                )}

                {/* Card Action: View Attempt Details */}
                <div className="lifefix-history-card__actions">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/history/${item.id}`)}
                    aria-label={`View solution for: ${item.user_message}`}
                  >
                    View Solution
                  </Button>
                </div>
              </Card>
            ))}
          </section>

          {/* Server-Side Pagination Bar */}
          {total > 0 && (
            <nav className="lifefix-history-pagination" aria-label="History pagination">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || isLoading}
                aria-label="Previous page"
              >
                &larr; Previous
              </Button>
              <span className="lifefix-history-pagination__info" aria-current="page">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={!hasNext || isLoading}
                aria-label="Next page"
              >
                Next &rarr;
              </Button>
            </nav>
          )}
        </>
      )}
    </PageContainer>
  );
}

export default HistoryPage;
