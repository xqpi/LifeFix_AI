import { Link } from "react-router-dom";
import "./Header.css";

export function Header() {
  return (
    <header className="lifefix-header">
      <div className="lifefix-header__inner">
        <Link to="/" className="lifefix-header__brand" aria-label="LifeFix Home">
          <div className="lifefix-header__logo-icon" aria-hidden="true">
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
              {/* Spark / Wrench balanced problem-solving glyph */}
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <span className="lifefix-header__wordmark">
            LifeFix<span className="lifefix-header__wordmark-dot">.</span>
          </span>
          <span className="lifefix-header__tagline">
            Personal Problem Solver
          </span>
        </Link>

        <div className="lifefix-header__actions">
          <div className="lifefix-header__status" title="Solver Service Online">
            <span
              className="lifefix-header__status-dot"
              aria-hidden="true"
            />
            <span>Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
