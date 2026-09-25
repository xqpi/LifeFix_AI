import { useState, type KeyboardEvent } from "react";
import "./StarRating.css";

export interface StarRatingProps {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
  isRtl?: boolean;
  className?: string;
}

const STAR_LABELS_EN = [
  "1 star - Poor",
  "2 stars - Fair",
  "3 stars - Good",
  "4 stars - Very good",
  "5 stars - Excellent",
];

const STAR_LABELS_AR = [
  "نجمة واحدة - ضعيف",
  "نجمتان - مقبول",
  "3 نجوم - جيد",
  "4 نجوم - جيد جداً",
  "5 نجوم - ممتاز",
];

export function StarRating({
  value,
  onChange,
  disabled = false,
  isRtl = false,
  className = "",
}: StarRatingProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  const labels = isRtl ? STAR_LABELS_AR : STAR_LABELS_EN;
  const activeRating = hoveredValue !== null ? hoveredValue : value;

  const handleClick = (star: number) => {
    if (disabled) return;
    // Toggle: if clicking the current value again, clear it; otherwise set it
    if (value === star) {
      onChange(null);
    } else {
      onChange(star);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, star: number) => {
    if (disabled) return;

    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = isRtl ? Math.max(1, star - 1) : Math.min(5, star + 1);
      onChange(next);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const prev = isRtl ? Math.min(5, star + 1) : Math.max(1, star - 1);
      onChange(prev);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      onChange(null);
    }
  };

  return (
    <div
      className={`lifefix-star-rating ${disabled ? "lifefix-star-rating--disabled" : ""} ${className}`}
      role="radiogroup"
      aria-label={isRtl ? "تقييم الرضا من 1 إلى 5 نجوم" : "Satisfaction rating, 1 to 5 stars"}
    >
      <div className="lifefix-star-rating__stars">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = activeRating !== null && star <= activeRating;
          const isSelected = value === star;

          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={labels[star - 1]}
              disabled={disabled}
              tabIndex={isSelected || (!value && star === 1) ? 0 : -1}
              onClick={() => handleClick(star)}
              onMouseEnter={() => !disabled && setHoveredValue(star)}
              onMouseLeave={() => !disabled && setHoveredValue(null)}
              onKeyDown={(e) => handleKeyDown(e, star)}
              className={`lifefix-star-btn ${isFilled ? "lifefix-star-btn--filled" : ""}`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={isFilled ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="lifefix-star-icon"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          );
        })}
      </div>

      {value !== null && (
        <span className="lifefix-star-rating__label" aria-hidden="true">
          {labels[value - 1]}
        </span>
      )}
    </div>
  );
}

export default StarRating;
