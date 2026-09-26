import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PageContainer from "../components/ui/PageContainer";
import "./LoginPage.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate, from]);

  if (isAuthenticated && !isAuthLoading) {
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const newFieldErrors: { email?: string; password?: string } = {};

    if (!cleanEmail) {
      newFieldErrors.email = "Email address is required.";
    } else if (!EMAIL_REGEX.test(cleanEmail)) {
      newFieldErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newFieldErrors.password = "Password is required.";
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setErrorMessage("Please correct the errors below to continue.");
      return;
    }

    setFieldErrors({});
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

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: undefined }));
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
    }
    if (errorMessage) {
      setErrorMessage(null);
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
            <div
              id="login-error-banner"
              className="lifefix-auth-error-banner"
              role="alert"
              aria-live="polite"
            >
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
                onChange={handleEmailChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={
                  fieldErrors.email
                    ? "auth-email-error"
                    : errorMessage
                    ? "login-error-banner"
                    : undefined
                }
                className={`lifefix-form-input ${
                  fieldErrors.email ? "lifefix-form-input--invalid" : ""
                }`}
              />
              {fieldErrors.email && (
                <span id="auth-email-error" className="lifefix-form-field-error" role="alert">
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div className="lifefix-form-group">
              <label htmlFor="auth-password" className="lifefix-form-label">
                Password
              </label>
              <div className="lifefix-password-wrapper">
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password
                      ? "auth-password-error"
                      : errorMessage
                      ? "login-error-banner"
                      : undefined
                  }
                  className={`lifefix-form-input ${
                    fieldErrors.password ? "lifefix-form-input--invalid" : ""
                  }`}
                />
                <button
                  type="button"
                  className="lifefix-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isSubmitting}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <span id="auth-password-error" className="lifefix-form-field-error" role="alert">
                  {fieldErrors.password}
                </span>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={isSubmitting}
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
