import type { ReactNode } from "react";
import "./PageContainer.css";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  as?: "main" | "section" | "div";
}

export function PageContainer({
  children,
  className = "",
  as: Component = "main",
}: PageContainerProps) {
  return (
    <Component className={`lifefix-page-container ${className}`.trim()}>
      {children}
    </Component>
  );
}

export default PageContainer;
