import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PageContainer from "../components/ui/PageContainer";
import "./LoginPage.css";

export function LoginPage() {
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate, from]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login({
        email: cleanEmail,
        password,
      });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setErrorMessage("Incorrect email or password. Please try again.");
        } else if (err.response?.data?.detail) {
          const detail = err.response.data.detail;
          setErrorMessage(typeof detail === "string" ? detail : "Authentication failed.");
        } else {
          setErrorMessage("Unable to connect to the authentication server. Please check your connection.");
        }
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer className="lifefix-auth-page">
      <div className="lifefix-auth-container">
        {/* Header Icon & Branding */}
        <div className="lifefix-auth-header">
          <div className="lifefix-auth-logo-badge" aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <h1 className="lifefix-auth-title">Welcome back to LifeFix</h1>
          <p className="lifefix-auth-subtitle">
            Sign in to own your problem solutions, ratings, and refinements.
          </p>
        </div>

        {/* Auth Card */}
        <Card variant="xl" elevated className="lifefix-auth-card">
          {errorMessage && (
            <div className="lifefix-auth-error-banner" role="alert">
              <svg
                width="16"
                height="16"
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
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="lifefix-auth-form" noValidate>
            <div className="lifefix-form-group">
              <label htmlFor="auth-email" className="lifefix-form-label">
                Email address
              </label>
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="lifefix-form-input"
              />
            </div>

            <div className="lifefix-form-group">
              <label htmlFor="auth-password" className="lifefix-form-label">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="lifefix-form-input"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={isSubmitting || !email.trim() || !password}
              className="lifefix-auth-submit"
            >
              Sign In
            </Button>
          </form>

          <div className="lifefix-auth-footer-divider">
            <span className="lifefix-auth-divider-line" />
            <span className="lifefix-auth-divider-text">or</span>
            <span className="lifefix-auth-divider-line" />
          </div>

          <div className="lifefix-auth-secondary-actions">
            <p className="lifefix-auth-switch">
              Don&apos;t have an account yet?{" "}
              <Link to="/register" className="lifefix-auth-link">
                Create an account
              </Link>
            </p>

            <div className="lifefix-auth-guest-option">
              <Link to="/" className="lifefix-auth-guest-link">
                Continue solving as guest &rarr;
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

export default LoginPage;
