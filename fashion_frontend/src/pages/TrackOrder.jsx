
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  PackageSearch,
  Check,
  Truck,
  Package,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

const steps = [
  { value: "placed", label: "Order Placed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
];

const statusIcons = [
  CheckCircle2,
  Check,
  Package,
  Truck,
  MapPin,
  CheckCircle2,
];

export default function TrackOrder() {
  const [params] = useSearchParams();

  const [orderNumber, setOrderNumber] = useState(
    params.get("order") || ""
  );

  const [email, setEmail] = useState(
    params.get("email") || ""
  );

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOrderNumber(params.get("order") || "");
    setEmail(params.get("email") || "");
  }, [params]);

  const handleTrack = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const query = new URLSearchParams({
        email: email.trim().toLowerCase(),
      });

      const response = await fetch(
        `${API_URL}/orders/${encodeURIComponent(
          orderNumber.trim()
        )}/track/?${query.toString()}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.detail ||
          "Order not found."
        );
      }

      setOrder(data);
    } catch (err) {
      setError(
        err.message ||
        "Unable to track your order."
      );
    } finally {
      setLoading(false);
    }
  };

  const currentStep = steps.findIndex(
    (step) => step.value === order?.status
  );

  const isCancelled =
    order?.status === "cancelled" ||
    order?.status === "returned";

  return (
    <main className="section-container">
      <div className="page-heading">
        <span className="eyebrow">
          ORDER UPDATES
        </span>

        <h1>Track Your Order</h1>

        <p>
          Stay updated with your Roséva Fashion delivery.
        </p>
      </div>

      <div className="roseva-tracking-card">
        <div className="roseva-tracking-header">
          <PackageSearch size={42} />

          <h2>Find Your Order</h2>

          <p>
            Enter your order number and registered
            email address.
          </p>
        </div>

        <form
          onSubmit={handleTrack}
          className="roseva-tracking-form"
        >
          <div className="filter-group">
            <label htmlFor="order-number">
              Order Number
            </label>

            <input
              id="order-number"
              value={orderNumber}
              onChange={(event) =>
                setOrderNumber(event.target.value)
              }
              placeholder="RSV-20261120-XXXXXXXX"
              required
            />
          </div>

          <div className="filter-group">
            <label htmlFor="track-email">
              Email Address
            </label>

            <input
              id="track-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button full-width"
            disabled={loading}
          >
            {loading
              ? "Checking Order..."
              : "Track Order"}
          </button>
        </form>

        {error && (
          <div
            className="roseva-tracking-error"
            role="alert"
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {order && (
          <div className="roseva-tracking-result">
            <div className="roseva-tracking-order-info">
              <div>
                <span className="eyebrow">
                  YOUR ORDER
                </span>

                <h2>#{order.order_number}</h2>
              </div>

              <span className="roseva-tracking-status">
                {order.status_display ||
                  order.status}
              </span>
            </div>

            {isCancelled ? (
              <div className="roseva-tracking-error">
                <AlertCircle size={20} />
                <span>
                  This order is marked as{" "}
                  {order.status_display ||
                    order.status}.
                </span>
              </div>
            ) : (
              <div className="roseva-tracking-timeline">
                {steps.map((step, index) => {
                  const Icon = statusIcons[index];

                  const completed =
                    index <= currentStep;

                  return (
                    <div
                      key={step.value}
                      className={`roseva-tracking-step ${
                        completed
                          ? "completed"
                          : ""
                      }`}
                    >
                      <div className="roseva-step-icon">
                        <Icon size={19} />
                      </div>

                      <div className="roseva-step-content">
                        <strong>{step.label}</strong>

                        <span>
                          {completed
                            ? "Completed"
                            : "Pending"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {(order.courier_name ||
              order.tracking_number) && (
              <div className="roseva-courier-details">
                <h3>Shipping Information</h3>

                {order.courier_name && (
                  <p>
                    <strong>Courier:</strong>{" "}
                    {order.courier_name}
                  </p>
                )}

                {order.tracking_number && (
                  <p>
                    <strong>Tracking Number:</strong>{" "}
                    {order.tracking_number}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
