import type { ReactNode } from "react";
import Header from "./Header";
import "./AppLayout.css";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="lifefix-layout">
      <Header />
      <div className="lifefix-layout__content">
        {children}
      </div>
      <footer className="lifefix-footer" role="contentinfo">
        <p className="lifefix-footer__text">
          <strong>LifeFix</strong> — AI Personal Problem Solver
        </p>
        <p className="lifefix-footer__subtext">
          Calm, practical guidance for everyday low-risk issues.
        </p>
      </footer>
    </div>
  );
}

export default AppLayout;
