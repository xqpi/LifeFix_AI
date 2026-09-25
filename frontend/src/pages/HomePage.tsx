import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageContainer from "../components/ui/PageContainer";
import "./HomePage.css";

const PREVIEW_CATEGORIES = [
  "Technology",
  "Home & Living",
  "Productivity",
  "Cooking",
  "Everyday Fixes",
];

export function HomePage() {
  return (
    <PageContainer>
      <div className="lifefix-home">
        {/* Hero Section */}
        <section className="lifefix-home__hero" aria-labelledby="home-heading">
          <Badge variant="primary" className="lifefix-home__badge">
            AI Personal Problem Solver
          </Badge>
          <h1 id="home-heading" className="lifefix-home__title">
            What would you like to solve today?
          </h1>
          <p className="lifefix-home__subtitle">
            Explain your issue naturally. LifeFix analyzes symptoms and provides
            structured, actionable steps to guide you to a resolution.
          </p>
        </section>

        {/* Workspace Preview Box */}
        <Card variant="xl" className="lifefix-workspace-preview" as="section" aria-label="Problem Workspace Preview">
          <div className="lifefix-workspace-preview__mock-input" aria-hidden="true">
            Describe what's happening... (e.g., My laptop becomes very slow when opening Chrome and VS Code together, or how do I clean white sneakers?)
          </div>

          <div className="lifefix-workspace-preview__categories">
            <span className="lifefix-workspace-preview__categories-label">
              Suggested Areas:
            </span>
            {PREVIEW_CATEGORIES.map((cat) => (
              <Badge key={cat} variant="default">
                {cat}
              </Badge>
            ))}
          </div>

          <div className="lifefix-workspace-preview__footer">
            <span className="lifefix-workspace-preview__hint">
              Press Ctrl + Enter on Windows/Linux; Cmd + Enter on macOS to solve
            </span>
            <Button
              variant="primary"
              disabled
              leftIcon={
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
              }
            >
              Solve Problem
            </Button>
          </div>
        </Card>

        {/* Core Principles Cards */}
        <section className="lifefix-home__pillars" aria-label="Core Capabilities">
          <div className="lifefix-pillar-card">
            <div className="lifefix-pillar-card__icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h2 className="lifefix-pillar-card__title">Verified Knowledge</h2>
            <p className="lifefix-pillar-card__description">
              Solutions are grounded in LifeFix verified problem cases using hybrid multilingual semantic search.
            </p>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}

export default HomePage;
