import type { HTMLAttributes, ReactNode } from "react";
import "./Card.css";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "xl" | "subtle";
  elevated?: boolean;
  interactive?: boolean;
  className?: string;
  as?: "div" | "article" | "section";
}

export function Card({
  children,
  variant = "default",
  elevated = false,
  interactive = false,
  className = "",
  as: Component = "div",
  ...rest
}: CardProps) {
  const classes = [
    "lifefix-card",
    variant !== "default" ? `lifefix-card--${variant}` : "",
    elevated ? "lifefix-card--elevated" : "",
    interactive ? "lifefix-card--interactive" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}

export default Card;
