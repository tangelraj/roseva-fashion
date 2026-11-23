
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Star, X } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import StarRating from "../components/StarRating";
import { submitProductReview } from "../services/reviewApi";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api/"
).replace(/\/+$/, "");

export default function MyOrders() {
  const {
    user,
    accessToken,
    loading: authLoading,
  } = useAuth();

  // ORDERS
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // REVIEW FORM
  const [reviewItem, setReviewItem] = useState(null);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [reviewedProducts, setReviewedProducts] =
    useState([]);

  // ======================================
  // LOAD CUSTOMER ORDERS
  // ======================================

  useEffect(() => {
    if (!accessToken) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadOrders() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/customers/orders/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load orders.");
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setOrders(
            Array.isArray(data)
              ? data
              : Array.isArray(data.results)
              ? data.results
              : []
          );
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => controller.abort();
  }, [accessToken]);

  // ======================================
  // OPEN REVIEW FORM
  // ======================================

  const openReview = (item) => {
    setReviewItem(item);
    setRating(0);
    setTitle("");
    setComment("");
    setReviewError("");
    setSuccessMessage("");
  };

  // ======================================
  // CLOSE REVIEW FORM
  // ======================================

  const closeReview = () => {
    if (submitting) return;

    setReviewItem(null);
    setReviewError("");
  };

  // ======================================
  // SUBMIT PRODUCT REVIEW
  // ======================================

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!reviewItem?.product_id) {
      setReviewError(
        "Product ID is missing from the order."
      );
      return;
    }

    if (rating < 1 || rating > 5) {
      setReviewError(
        "Please select a rating between 1 and 5 stars."
      );
      return;
    }

    if (!comment.trim()) {
      setReviewError("Please write your review.");
      return;
    }

    if (!accessToken) {
      setReviewError(
        "Please log in again to submit your review."
      );
      return;
    }

    setSubmitting(true);
    setReviewError("");

    try {
      await submitProductReview(
        reviewItem.product_id,
        {
          rating,
          title: title.trim(),
          comment: comment.trim(),
        },
        accessToken
      );

      // Update reviewed product IDs
      setReviewedProducts((previous) => [
        ...new Set([
          ...previous,
          reviewItem.product_id,
        ]),
      ]);

      // Update order items immediately
      setOrders((previousOrders) =>
        previousOrders.map((order) => ({
          ...order,
          items: (order.items || []).map((item) => {
            const productId =
              item.product_id ??
              (typeof item.product === "object"
                ? item.product?.id
                : item.product);

            if (
              String(productId) ===
              String(reviewItem.product_id)
            ) {
              return {
                ...item,
                already_reviewed: true,
                can_review: false,
              };
            }

            return item;
          }),
        }))
      );

      setSuccessMessage(
        `Your review for ${reviewItem.product_name} ` +
        "has been submitted successfully. " +
        "It will appear after admin approval."
      );

      setReviewItem(null);
      setRating(0);
      setTitle("");
      setComment("");
    } catch (err) {
      setReviewError(
        err.message || "Unable to submit review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================
  // AUTHENTICATION
  // ======================================

  if (authLoading) {
    return (
      <main className="section-container">
        <p>Loading account...</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ======================================
  // MY ORDERS PAGE
  // ======================================

  return (
    <main className="section-container">
      <div className="page-heading">
        <h1>My Orders</h1>
        <p>
          View your Roséva Fashion purchases,
          track orders, and review delivered products.
        </p>
      </div>

      {/* LOADING */}

      {loading && <p>Loading orders...</p>}

      {/* ERROR */}

      {error && (
        <p role="alert" className="review-error">
          {error}
        </p>
      )}

      {/* SUCCESS MESSAGE */}

      {successMessage && (
        <p className="review-success" role="status">
          {successMessage}
        </p>
      )}

      {/* EMPTY ORDERS */}

      {!loading &&
        !error &&
        orders.length === 0 && (
          <div className="empty-state">
            <h2>No orders yet</h2>

            <p>
              Your purchased products will
              appear here.
            </p>

            <Link
              to="/shop"
              className="primary-button"
            >
              Start Shopping
            </Link>
          </div>
        )}

      {/* ORDER LIST */}

      {!loading &&
        !error &&
        orders.map((order) => {
          const delivered =
            String(order.status || "")
              .toLowerCase() === "delivered";

          return (
            <div
              className="order-summary"
              key={order.order_number}
              style={{ marginBottom: 20 }}
            >
              {/* ORDER NUMBER */}

              <h2>
                Order #{order.order_number}
              </h2>

              {/* ORDER STATUS */}

              <p>
                <strong>Status:</strong>{" "}
                {order.status_display ||
                  order.status}
              </p>

              {/* PAYMENT */}

              <p>
                <strong>Payment:</strong>{" "}
                {(order.payment_method || "")
                  .toUpperCase()}
                {" — "}
                {order.payment_status}
              </p>

              {/* PURCHASED PRODUCTS */}

              {(order.items || []).map(
                (item, index) => {
                  const productId =
                    item.product_id ??
                    (typeof item.product === "object"
                      ? item.product?.id
                      : item.product);

                  const reviewed =
                    item.already_reviewed === true ||
                    reviewedProducts.some(
                      (id) =>
                        String(id) ===
                        String(productId)
                    );

                  const canReview =
                    item.can_review === true &&
                    !reviewed &&
                    delivered &&
                    Boolean(productId);

                  return (
                    <div
                      className="order-product-review-row"
                      key={
                        item.id ||
                        `${order.order_number}-${index}`
                      }
                    >
                      {/* PRODUCT INFORMATION */}

                      <div className="summary-row">
                        <span>
                          {item.product_name}

                          {item.size
                            ? ` (${item.size})`
                            : ""}

                          {" × "}
                          {item.quantity}
                        </span>

                        <strong>
                          ₹{item.total}
                        </strong>
                      </div>

                      {/* REVIEW BUTTON */}

                      <div className="order-review-action">
                        {reviewed ? (
                          <span className="review-success">
                            ★ Already Reviewed
                          </span>
                        ) : !delivered ? (
                          <span className="review-pending-text">
                            Review available after delivery
                          </span>
                        ) : !productId ? (
                          <span className="review-error">
                            Product ID missing.
                            Backend update required.
                          </span>
                        ) : canReview ? (
                          <button
                            type="button"
                            className="write-review-button"
                            onClick={() =>
                              openReview({
                                ...item,
                                product_id: productId,
                              })
                            }
                          >
                            <Star size={16} />
                            Write Review
                          </button>
                        ) : (
                          <span className="review-pending-text">
                            Review unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
              )}

              {/* ORDER TOTAL */}

              <div className="summary-row summary-total">
                <span>Total</span>

                <strong>
                  ₹{order.total}
                </strong>
              </div>

              {/* TRACK ORDER */}

              <Link
                to={`/track-order?order=${encodeURIComponent(
                  order.order_number
                )}&email=${encodeURIComponent(
                  user.email || order.email || ""
                )}`}
              >
                Track Order
              </Link>
            </div>
          );
        })}

      {/* ======================================
          REVIEW MODAL
      ====================================== */}

      {reviewItem && (
        <div className="review-modal-overlay">
          <div
            className="review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
          >
            {/* MODAL HEADER */}

            <div className="review-modal-header">
              <h2 id="review-modal-title">
                Write a Review
              </h2>

              <button
                type="button"
                onClick={closeReview}
                disabled={submitting}
                aria-label="Close review form"
              >
                <X size={22} />
              </button>
            </div>

            {/* PRODUCT NAME */}

            <p className="review-product-name">
              {reviewItem.product_name}
            </p>

            {/* REVIEW FORM */}

            <form onSubmit={handleSubmitReview}>
              {/* STAR RATING */}

              <label className="review-label">
                Your Rating
              </label>

              <StarRating
                rating={rating}
                onChange={setRating}
                size={30}
              />

              {/* REVIEW TITLE */}

              <label
                className="review-label"
                htmlFor="review-title"
              >
                Review Title (Optional)
              </label>

              <input
                id="review-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                maxLength={150}
                placeholder="Beautiful product!"
              />

              {/* REVIEW COMMENT */}

              <label
                className="review-label"
                htmlFor="review-comment"
              >
                Your Review
              </label>

              <textarea
                id="review-comment"
                rows={5}
                value={comment}
                onChange={(event) =>
                  setComment(event.target.value)
                }
                maxLength={2000}
                placeholder="Tell us about the quality, fitting, and material..."
                required
              />

              {/* REVIEW ERROR */}

              {reviewError && (
                <p
                  role="alert"
                  className="review-error"
                >
                  {reviewError}
                </p>
              )}

              {/* SUBMIT BUTTON */}

              <button
                type="submit"
                className="primary-button review-submit"
                disabled={
                  submitting ||
                  rating === 0 ||
                  !comment.trim()
                }
              >
                {submitting
                  ? "Submitting Review..."
                  : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
