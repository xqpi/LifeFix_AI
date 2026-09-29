import type { ReactNode } from "react";
import Header from "./Header";
import "./AppLayout.css";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="lifefix-layout">
      {/* Pearlescent holographic foil sheet and translucent iridescent orbs */}
      <div className="lifefix-ambient-bg" aria-hidden="true">
        {/* Layered iridescent foil refraction regions */}
        <div className="lifefix-holo-foil lifefix-holo-foil--cyan" />
        <div className="lifefix-holo-foil lifefix-holo-foil--pink" />
        <div className="lifefix-holo-foil lifefix-holo-foil--lavender" />
        <div className="lifefix-holo-foil lifefix-holo-foil--peach" />

        {/* Translucent soap bubbles & pearlescent glass spheres */}
        <div className="lifefix-soap-bubble lifefix-soap-bubble--top-left" />
        <div className="lifefix-soap-bubble lifefix-soap-bubble--top-right" />
        <div className="lifefix-soap-bubble lifefix-soap-bubble--mid-left" />
        <div className="lifefix-soap-bubble lifefix-soap-bubble--bottom-right" />
      </div>

      <Header />
      <div className="lifefix-layout__content">
        {children}
      </div>

      <footer className="lifefix-footer" role="contentinfo">
        <p className="lifefix-footer__text">
          <strong>LifeFix</strong> · Personal Problem Solver
        </p>
        <p className="lifefix-footer__subtext">
          Calm, practical guidance for everyday low-risk issues.
        </p>
      </footer>
    </div>
  );
}

export default AppLayout;
