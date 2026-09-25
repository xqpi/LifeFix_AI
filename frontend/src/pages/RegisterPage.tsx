import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PageContainer from "../components/ui/PageContainer";
import "./LoginPage.css"; // Reuse cohesive auth layout and form styling

export function RegisterPage() {
  const { register, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect to home
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    // Client-side validations
    if (cleanName.length < 2) {
      setErrorMessage("Please enter a name with at least 2 characters.");
      return;
    }

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await register({
        name: cleanName,
        email: cleanEmail,
        password,
      });
      navigate("/", { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          const detail = err.response.data?.detail;
          if (typeof detail === "string" && detail.toLowerCase().includes("already exists")) {
            setErrorMessage("An account with this email address already exists. Please sign in instead.");
          } else {
            setErrorMessage(typeof detail === "string" ? detail : "Account registration failed.");
          }
        } else if (err.response?.status === 422) {
          setErrorMessage("Please check your details. Password must be 8-72 characters long.");
        } else {
          setErrorMessage("Unable to connect to the registration server. Please try again.");
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <h1 className="lifefix-auth-title">Create your LifeFix account</h1>
          <p className="lifefix-auth-subtitle">
            Get personalized problem-solving, track solutions, and refine recommendations.
          </p>
        </div>

        {/* Register Card */}
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
              <label htmlFor="reg-name" className="lifefix-form-label">
                Full name or display name
              </label>
              <input
                id="reg-name"
                type="text"
                required
                autoComplete="name"
                placeholder="Jane Developer"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                disabled={isSubmitting}
                className="lifefix-form-input"
              />
            </div>

            <div className="lifefix-form-group">
              <label htmlFor="reg-email" className="lifefix-form-label">
                Email address
              </label>
              <input
                id="reg-email"
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
              <label htmlFor="reg-password" className="lifefix-form-label">
                Password (min 8 characters)
              </label>
              <input
                id="reg-password"
                type="password"
                required
                autoComplete="new-password"
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
              disabled={isSubmitting || !name.trim() || !email.trim() || password.length < 8}
              className="lifefix-auth-submit"
            >
              Create Account
            </Button>
          </form>

          <div className="lifefix-auth-footer-divider">
            <span className="lifefix-auth-divider-line" />
            <span className="lifefix-auth-divider-text">or</span>
            <span className="lifefix-auth-divider-line" />
          </div>

          <div className="lifefix-auth-secondary-actions">
            <p className="lifefix-auth-switch">
              Already have an account?{" "}
              <Link to="/login" className="lifefix-auth-link">
                Sign in
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

export default RegisterPage;
