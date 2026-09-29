import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PageContainer from "../components/ui/PageContainer";
import LifeFixLogo from "../components/ui/LifeFixLogo";
import "./LoginPage.css"; // Reuse cohesive auth layout and form styling

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RegisterFieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function RegisterPage() {
  const { register, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});

  // If already logged in, redirect to home
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  if (isAuthenticated && !isAuthLoading) {
    return null;
  }

  const validateForm = (): boolean => {
    const errors: RegisterFieldErrors = {};
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    // 1. Name validation
    if (!cleanName) {
      errors.name = "Name is required.";
    }

    // 2. Email validation
    if (!cleanEmail) {
      errors.email = "Email address is required.";
    } else if (!EMAIL_REGEX.test(cleanEmail)) {
      errors.email = "Please enter a valid email address.";
    }

    // 3. Password validation (matches backend: 8 to 72 bytes)
    const passwordBytes = new TextEncoder().encode(password).length;
    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    } else if (passwordBytes > 72) {
      errors.password = "Password cannot exceed 72 bytes.";
    }

    // 4. Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setErrorMessage("Please resolve the issues highlighted below.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) {
      return;
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();

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
            setFieldErrors({ email: "This email address is already registered." });
            setErrorMessage("An account with this email address already exists. Please sign in instead.");
          } else {
            setErrorMessage(typeof detail === "string" ? detail : "Account registration failed.");
          }
        } else if (err.response?.status === 422) {
          setErrorMessage("Please check your details. Password must be 8-72 characters long.");
        } else {
          setErrorMessage("Unable to connect to the registration server. Please check your connection and try again.");
        }
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (
    field: keyof RegisterFieldErrors,
    setter: (val: string) => void
  ) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
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
          <div className="lifefix-auth-logo-wrapper">
            <LifeFixLogo variant="icon" size="lg" />
          </div>
          <h1 className="lifefix-auth-title">Create your LifeFix account</h1>
          <p className="lifefix-auth-subtitle">
            Get personalized problem-solving, track solutions, and refine recommendations.
          </p>
        </div>

        {/* Register Card */}
        <Card variant="xl" elevated className="lifefix-auth-card">
          {errorMessage && (
            <div
              id="register-error-banner"
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
            {/* Name */}
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
                onChange={handleFieldChange("name", setName)}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={
                  fieldErrors.name
                    ? "reg-name-error"
                    : errorMessage
                    ? "register-error-banner"
                    : undefined
                }
                className={`lifefix-form-input ${
                  fieldErrors.name ? "lifefix-form-input--invalid" : ""
                }`}
              />
              {fieldErrors.name && (
                <span id="reg-name-error" className="lifefix-form-field-error" role="alert">
                  {fieldErrors.name}
                </span>
              )}
            </div>

            {/* Email */}
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
                onChange={handleFieldChange("email", setEmail)}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={
                  fieldErrors.email
                    ? "reg-email-error"
                    : errorMessage
                    ? "register-error-banner"
                    : undefined
                }
                className={`lifefix-form-input ${
                  fieldErrors.email ? "lifefix-form-input--invalid" : ""
                }`}
              />
              {fieldErrors.email && (
                <span id="reg-email-error" className="lifefix-form-field-error" role="alert">
                  {fieldErrors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="lifefix-form-group">
              <label htmlFor="reg-password" className="lifefix-form-label">
                Password (min 8 characters)
              </label>
              <div className="lifefix-password-wrapper">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={handleFieldChange("password", setPassword)}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password
                      ? "reg-password-error"
                      : errorMessage
                      ? "register-error-banner"
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
                <span id="reg-password-error" className="lifefix-form-field-error" role="alert">
                  {fieldErrors.password}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="lifefix-form-group">
              <label htmlFor="reg-confirm-password" className="lifefix-form-label">
                Confirm password
              </label>
              <div className="lifefix-password-wrapper">
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={handleFieldChange("confirmPassword", setConfirmPassword)}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={
                    fieldErrors.confirmPassword
                      ? "reg-confirm-password-error"
                      : errorMessage
                      ? "register-error-banner"
                      : undefined
                  }
                  className={`lifefix-form-input ${
                    fieldErrors.confirmPassword ? "lifefix-form-input--invalid" : ""
                  }`}
                />
                <button
                  type="button"
                  className="lifefix-password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  disabled={isSubmitting}
                  aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                  aria-pressed={showConfirmPassword}
                  title={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                >
                  {showConfirmPassword ? (
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
              {fieldErrors.confirmPassword && (
                <span id="reg-confirm-password-error" className="lifefix-form-field-error" role="alert">
                  {fieldErrors.confirmPassword}
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
