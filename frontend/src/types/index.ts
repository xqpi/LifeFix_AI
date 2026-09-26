/**
 * LifeFix Frontend Foundation Types & Backend API Schemas
 * Strictly matches backend/app/schemas/solver.py
 */

import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "success";
export type ButtonSize = "sm" | "md" | "lg";


export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info";

export type BadgeSize = "sm" | "md";

export interface ComponentBaseProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Suggested Problem Categories
 */
export type ProblemCategory =
  | "Technology"
  | "Home & Living"
  | "Productivity"
  | "Cooking"
  | "Everyday Fixes";

export interface CategoryOption {
  id: ProblemCategory;
  label: string;
}

/**
 * Structured representation of an individual solution step.
 * Matches LifeFixSolutionStep from backend/app/schemas/solver.py
 */
export interface LifeFixSolutionStep {
  step_number: number;
  title: string;
  instruction: string;
  difficulty: string;
  estimated_time_minutes: number;
}

/**
 * Reference to a retrieved LifeFix problem case from the knowledge base.
 * Matches LifeFixSourceCase from backend/app/schemas/solver.py
 */
export interface LifeFixSourceCase {
  problem_id: string;
  title: string;
}

/**
 * Structured LifeFix solution response produced by AI problem solving or RAG fallback.
 * Matches LifeFixSolutionResponse from backend/app/schemas/solver.py
 */
export interface LifeFixSolutionResponse {
  attempt_id: string;
  understanding: string;
  possible_causes: string[];
  recommended_steps: LifeFixSolutionStep[];
  explanations: string[];
  warnings_or_notes: string[];
  follow_up_question: string | null;
  source_cases: LifeFixSourceCase[];
}

/**
 * Payload sent to POST /api/solve
 * Matches SolveProblemRequest from backend/app/schemas/solver.py
 */
export interface SolveProblemRequest {
  problem_description: string;
  category_hint: string | null;
}

/**
 * User feedback payload for an existing ProblemAttempt.
 * Matches AttemptFeedbackRequest from backend/app/schemas/solver.py
 */
export interface AttemptFeedbackRequest {
  was_successful: boolean;
  rating?: number | null;
  comment?: string | null;
}

/**
 * Response returned upon successfully recording feedback for a ProblemAttempt.
 * Matches AttemptFeedbackResponse from backend/app/schemas/solver.py
 */
export interface AttemptFeedbackResponse {
  attempt_id: string;
  was_successful: boolean;
  feedback_recorded: boolean;
  message: string;
}

export interface RefineProblemRequest {
  additional_information: string;
}

/**
 * Single problem attempt item in user history list.
 * Matches backend app.schemas.attempt.AttemptHistoryItem.
 */
export interface AttemptHistoryItem {
  id: string;
  user_message: string;
  created_at: string;
  was_successful: boolean | null;
  parent_attempt_id: string | null;
  solution_preview: string | null;
}

/**
 * Paginated attempt history response from GET /api/attempts/history.
 * Matches backend app.schemas.attempt.AttemptHistoryResponse.
 */
export interface AttemptHistoryResponse {
  items: AttemptHistoryItem[];
  page: number;
  limit: number;
  total: number;
  has_next: boolean;
}

/**
 * Detailed problem attempt response from GET /api/attempts/{attempt_id}.
 * Matches backend app.schemas.attempt.AttemptDetailResponse.
 */
export interface AttemptDetailResponse {
  id: string;
  user_message: string;
  created_at: string;
  was_successful: boolean | null;
  parent_attempt_id: string | null;
  solution: LifeFixSolutionResponse;
}

/**
 * User account model returned by backend /api/auth endpoints.
 * Matches backend/app/schemas/auth.py UserResponse.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

/**
 * Authentication response with access token returned by POST /api/auth/login.
 * Matches backend/app/schemas/auth.py TokenResponse.
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

/**
 * Registration request payload sent to POST /api/auth/register.
 * Matches backend/app/schemas/auth.py UserRegisterRequest.
 */
export interface UserRegisterRequest {
  name: string;
  email: string;
  password: string;
}

/**
 * Login request payload sent to POST /api/auth/login.
 * Matches backend/app/schemas/auth.py UserLoginRequest.
 */
export interface UserLoginRequest {
  email: string;
  password: string;
}

/**
 * Shape of the frontend authentication context state and handlers.
 */
export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: UserLoginRequest) => Promise<void>;
  register: (payload: UserRegisterRequest) => Promise<void>;
  logout: () => void;
}
