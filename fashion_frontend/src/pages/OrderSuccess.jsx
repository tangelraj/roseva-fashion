
import {
  Link,
  useLocation,
  useSearchParams,
} from "react-router-dom";

import {
  CheckCircle2,
  PackageCheck,
} from "lucide-react";

export default function OrderSuccess() {
  const location = useLocation();
  const [params] = useSearchParams();

  const orderNumber = params.get("order");
  const order = location.state?.order;
  const email = location.state?.email || "";

  const paymentMethod = order?.payment_method || "cod";

  const paymentLabels = {
    cod: "Cash on Delivery",
    upi: "UPI Payment",
    card: "Debit / Credit Card",
  };

  return (
    <main className="section-container empty-state">
      <CheckCircle2
        size={65}
        color="#38864a"
      />

      <h1>Order Placed Successfully!</h1>

      <p>
        Thank you for shopping with Roséva Fashion.
      </p>

      <h2>
        Order Number: {orderNumber || "Not available"}
      </h2>

      <p>
        Payment Method:{" "}
        <strong>
          {paymentLabels[paymentMethod] || paymentMethod}
        </strong>
      </p>

      <p>
        Payment Status:{" "}
        <strong>
          {order?.payment_status || "Pending"}
        </strong>
      </p>

      {paymentMethod !== "cod" && (
        <p>
          This is a demo order. No online payment
          has been collected.
        </p>
      )}

      <PackageCheck size={35} />

      <p>
        Save your order number and email address
        to track your order.
      </p>

      {orderNumber && (
        <Link
          to={`/track-order?order=${encodeURIComponent(
            orderNumber
          )}&email=${encodeURIComponent(email)}`}
          className="primary-button"
        >
          Track Your Order
        </Link>
      )}

      <Link
        to="/shop"
        className="continue-shopping"
      >
        Continue Shopping
      </Link>
    </main>
  );
}
