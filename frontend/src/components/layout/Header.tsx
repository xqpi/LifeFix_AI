import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import "./Header.css";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const displayName = user?.name ? user.name.split(" ")[0] : "Account";
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

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
          {/* Service status indicator */}
          <div className="lifefix-header__status" title="Solver Service Online">
            <span
              className="lifefix-header__status-dot"
              aria-hidden="true"
            />
            <span>Ready</span>
          </div>

          {/* Authentication Actions */}
          <div className="lifefix-header__auth">
            {isAuthenticated && user ? (
              <div className="lifefix-header__user-menu">
                <div
                  className="lifefix-header__user-chip"
                  title={`Signed in as ${user.name} (${user.email})`}
                >
                  <span className="lifefix-header__user-avatar" aria-hidden="true">
                    {userInitial}
                  </span>
                  <span className="lifefix-header__user-name">
                    {displayName}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="lifefix-header__logout-btn"
                  aria-label="Sign out of account"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="lifefix-header__auth-links">
                <Link
                  to="/login"
                  className="lifefix-header__signin-link"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="lifefix-header__signup-btn"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
