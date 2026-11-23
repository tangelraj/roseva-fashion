
import { Star } from "lucide-react";

export default function StarRating({
  rating = 0,
  onChange,
  size = 20,
}) {
  const interactive = typeof onChange === "function";

  return (
    <div
      className="review-stars"
      role={interactive ? "group" : undefined}
      aria-label={
        interactive
          ? "Select a rating"
          : `${rating} out of 5 stars`
      }
    >
      {[1, 2, 3, 4, 5].map((star) =>
        interactive ? (
          <button
            key={star}
            type="button"
            className="review-star-button"
            onClick={() => onChange(star)}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            aria-pressed={rating === star}
          >
            <Star
              size={size}
              fill={star <= rating ? "#e7a52b" : "none"}
              color={
                star <= rating ? "#e7a52b" : "#c9c9c9"
              }
            />
          </button>
        ) : (
          <Star
            key={star}
            size={size}
            fill={star <= Math.round(rating) ? "#e7a52b" : "none"}
            color={
              star <= Math.round(rating)
                ? "#e7a52b"
                : "#c9c9c9"
            }
          />
        )
      )}
    </div>
  );
}
