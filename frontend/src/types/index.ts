/**
 * LifeFix Frontend Foundation Types
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
