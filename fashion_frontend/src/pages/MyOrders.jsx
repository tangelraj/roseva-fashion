
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

export default function MyOrders() {
  const { user, accessToken, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadOrders() {
      setLoading(true);

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
        setOrders(data);
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

  if (authLoading) return <p>Loading account...</p>;

  if (!user) return <Navigate to="/login" replace />;

  return (
    <main className="section-container">
      <div className="page-heading">
        <h1>My Orders</h1>
        <p>View your Roséva Fashion purchases.</p>
      </div>

      {loading && <p>Loading orders...</p>}

      {error && (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="empty-state">
          <h2>No orders yet</h2>
          <p>Your new account orders will appear here.</p>
          <Link to="/shop" className="primary-button">
            Start Shopping
          </Link>
        </div>
      )}

      {!loading && orders.map((order) => (
        <div
          className="order-summary"
          key={order.order_number}
          style={{ marginBottom: 20 }}
        >
          <h2>Order #{order.order_number}</h2>

          <p>
            <strong>Status:</strong>{" "}
            {order.status_display}
          </p>

          <p>
            <strong>Payment:</strong>{" "}
            {order.payment_method.toUpperCase()}
            {" — "}
            {order.payment_status}
          </p>

          {order.items.map((item, index) => (
            <div
              className="summary-row"
              key={`${order.order_number}-${index}`}
            >
              <span>
                {item.product_name} ({item.size})
                {" × "}
                {item.quantity}
              </span>

              <strong>₹{item.total}</strong>
            </div>
          ))}

          <div className="summary-row summary-total">
            <span>Total</span>
            <strong>₹{order.total}</strong>
          </div>

          <Link
            to={`/track-order?order=${encodeURIComponent(
              order.order_number
            )}&email=${encodeURIComponent(user.email)}`}
          >
            Track Order
          </Link>
        </div>
      ))}
    </main>
  );
}
