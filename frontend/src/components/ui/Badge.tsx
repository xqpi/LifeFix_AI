import type { HTMLAttributes, ReactNode } from "react";
import type { BadgeSize, BadgeVariant } from "../../types";
import "./Badge.css";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  square?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  square = false,
  className = "",
  ...rest
}: BadgeProps) {
  const classes = [
    "lifefix-badge",
    `lifefix-badge--${variant}`,
    size === "sm" ? "lifefix-badge--sm" : "",
    square ? "lifefix-badge--square" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}

export default Badge;
