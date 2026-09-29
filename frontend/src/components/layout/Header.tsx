import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import LifeFixLogo from "../ui/LifeFixLogo";
import "./Header.css";

export function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isHistoryActive = location.pathname === "/history";

  const displayName = user?.name ? user.name.split(" ")[0] : "Account";
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <header className="lifefix-header">
      <div className="lifefix-header__inner">
        <Link to="/" className="lifefix-header__brand" aria-label="LifeFix Home">
          <LifeFixLogo variant="full" size="md" showTagline />
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
            {isLoading ? (
              <div
                className="lifefix-header__skeleton"
                aria-label="Checking account session"
                role="status"
              />
            ) : isAuthenticated && user ? (
              <div className="lifefix-header__user-menu">
                <Link
                  to="/history"
                  className={`lifefix-header__history-link ${
                    isHistoryActive ? "lifefix-header__history-link--active" : ""
                  }`}
                  aria-label="View your problem-solving history"
                >
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
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>History</span>
                </Link>

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
