/**
 * LifeFix Frontend Foundation Types & Backend API Schemas
 * Strictly matches backend/app/schemas/solver.py
 */

import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";
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
