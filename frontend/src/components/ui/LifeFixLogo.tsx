import type { SVGProps } from "react";
import "./LifeFixLogo.css";

export interface LifeFixLogoProps extends SVGProps<SVGSVGElement> {
  variant?: "icon" | "full";
  size?: number | "sm" | "md" | "lg";
  className?: string;
  showTagline?: boolean;
}

/**
 * Original LifeFix vector logo with Pearlescent Holographic / Liquid Glass styling.
 * Directly inspired by 3D liquid iridescent glass with chromatic caustics:
 * - Flowing liquid "L" ribbon contour in translucent glass
 * - Spectral dispersion rainbow caustics (cyan, gold, pink, violet, blue)
 * - Glossy specular highlight ridge running along the curve
 * - Prismatic diamond refraction spark
 */
export function LifeFixLogo({
  variant = "icon",
  size = "md",
  className = "",
  showTagline = false,
  ...props
}: LifeFixLogoProps) {
  let pixelSize = 34;
  if (typeof size === "number") {
    pixelSize = size;
  } else if (size === "sm") {
    pixelSize = 28;
  } else if (size === "md") {
    pixelSize = 34;
  } else if (size === "lg") {
    pixelSize = 48;
  }

  const iconSvg = (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`lifefix-logo__icon ${className}`}
      aria-hidden="true"
      {...props}
    >
      <defs>
        {/* Spectral caustic refraction gradient along the liquid glass body */}
        <linearGradient id="lifefix-caustic-ribbon" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8DF0EC" />
          <stop offset="25%" stopColor="#FDF7A8" />
          <stop offset="50%" stopColor="#FFA4E0" />
          <stop offset="75%" stopColor="#CCA8FD" />
          <stop offset="100%" stopColor="#98C8FE" />
        </linearGradient>

        {/* Translucent pearl liquid glass fill */}
        <linearGradient id="lifefix-pearl-glass" x1="8" y1="6" x2="30" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="30%" stopColor="#F2F5FB" stopOpacity="0.85" />
          <stop offset="70%" stopColor="#E6ECF8" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.90" />
        </linearGradient>

        {/* Specular ridge highlight sheen */}
        <linearGradient id="lifefix-specular-ridge" x1="10" y1="8" x2="30" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.60" />
          <stop offset="70%" stopColor="#8DF0EC" stopOpacity="0.40" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Soft iridescent drop shadow */}
        <filter id="lifefix-liquid-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodColor="#7E89CA" floodOpacity="0.22" />
        </filter>
      </defs>

      <g filter="url(#lifefix-liquid-glow)">
        {/* Outer prismatic caustic rim for the fluid "L" */}
        <path
          d="M7 10 C7 7.5, 9.5 5, 12 5 C14.5 5, 17 7.5, 17 10 L17 23 C17 24.5, 18.5 26, 20 26 L27 26 C29.5 26, 32 28.5, 32 31 C32 33.5, 29.5 36, 27 36 L12 36 C9.5 36, 7 33.5, 7 31 Z"
          fill="url(#lifefix-caustic-ribbon)"
          opacity="0.9"
        />

        {/* Inner pearl liquid glass body */}
        <path
          d="M8.5 10.5 C8.5 8.5, 10 7, 12 7 C14 7, 15.5 8.5, 15.5 10.5 L15.5 23.5 C15.5 25.5, 17.5 27.5, 19.5 27.5 L27 27.5 C29 27.5, 30.5 29, 30.5 31 C30.5 33, 29 34.5, 27 34.5 L12 34.5 C10 34.5, 8.5 33, 8.5 31 Z"
          fill="url(#lifefix-pearl-glass)"
        />

        {/* Crisp specular highlight line along the liquid glass ridge */}
        <path
          d="M12 8 L12 24 C12 27, 14 29, 17 29 L28 29"
          stroke="url(#lifefix-specular-ridge)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Floating iridescent refraction spark orb */}
        <circle
          cx="28"
          cy="12"
          r="6"
          fill="url(#lifefix-caustic-ribbon)"
        />

        {/* White specular center */}
        <circle
          cx="28"
          cy="12"
          r="4"
          fill="#FFFFFF"
        />

        {/* Prismatic diamond star glint */}
        <path
          d="M28 8.5 L28.6 11.2 L31.5 12 L28.6 12.8 L28 15.5 L27.4 12.8 L24.5 12 L27.4 11.2 Z"
          fill="#8DF0EC"
        />
        <circle
          cx="28"
          cy="12"
          r="1.2"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  );

  if (variant === "icon") {
    return iconSvg;
  }

  return (
    <div className={`lifefix-logo-brand ${className}`}>
      {iconSvg}
      <div className="lifefix-logo-brand__text-group">
        <span className="lifefix-logo-brand__wordmark">
          LifeFix<span className="lifefix-logo-brand__dot">.</span>
        </span>
        {showTagline && (
          <span className="lifefix-logo-brand__tagline">
            Personal Problem Solver
          </span>
        )}
      </div>
    </div>
  );
}

export default LifeFixLogo;
