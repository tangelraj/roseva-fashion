
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";

import {
  Banknote,
  CreditCard,
  Smartphone,
  ShieldCheck,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

// All three payment methods are selectable.
// UPI and Card are DEMO methods only.
const paymentOptions = [
  {
    value: "cod",
    label: "Cash on Delivery",
    description: "Pay when your order arrives",
    Icon: Banknote,
  },
  {
    value: "upi",
    label: "UPI Payment",
    description: "Demo payment — no money collected",
    Icon: Smartphone,
  },
  {
    value: "card",
    label: "Debit / Credit Card",
    description: "Demo payment — no money collected",
    Icon: CreditCard,
  },
];

export default function Checkout() {
  const navigate = useNavigate();

  // Customer authentication
  const {
    user,
    accessToken,
    loading: authLoading,
  } = useAuth();

  // Shopping cart
  const {
    cart,
    cartTotal,
    clearCart,
  } = useShop();

  // Delivery form
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Prefill registered customer details
  useEffect(() => {
    if (user) {
      setForm((previous) => ({
        ...previous,
        full_name:
          previous.full_name || user.full_name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  // Shipping calculation
  const shipping =
    cartTotal >= 1999 || cartTotal === 0 ? 0 : 99;

  const total = cartTotal + shipping;

  const formatPrice = (amount) =>
    Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

  // Update delivery information
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Submit order to Django
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading || authLoading || cart.length === 0) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Use registered email for logged-in customers.
      const deliveryData = {
        ...form,
        email: user?.email || form.email,
      };

      // Prepare headers.
      const headers = {
        "Content-Type": "application/json",
      };

      // Send JWT token when customer is logged in.
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(
        `${API_URL}/orders/`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            ...deliveryData,
            payment_method: paymentMethod,
            items: cart.map((item) => ({
              product_id: item.id,
              size: item.selectedSize || "",
              quantity: item.quantity,
            })),
          }),
        }
      );

      const data = await response.json().catch(
        () => ({})
      );

      // Handle backend errors
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Your login session has expired. Please log in again."
          );
        }

        if (response.status === 404) {
          throw new Error(
            "Django orders API was not found. Check /api/orders/."
          );
        }

        const backendError =
          data.error ||
          data.detail ||
          "Unable to place your order.";

        throw new Error(
          typeof backendError === "string"
            ? backendError
            : JSON.stringify(backendError)
        );
      }

      // Confirm order number was returned
      if (!data.order_number) {
        throw new Error(
          "The server did not return an order number. Please check Django Admin before trying again."
        );
      }

      // Clear cart only after successful order
      clearCart();

      // Redirect to order success page
      navigate(
        `/order-success?order=${encodeURIComponent(
          data.order_number
        )}`,
        {
          state: {
            order: data,
            email: deliveryData.email,
          },
        }
      );
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Empty cart
  if (cart.length === 0) {
    return (
      <main className="section-container empty-state">
        <h1>Your Shopping Cart is Empty</h1>

        <p>
          Add products before proceeding to checkout.
        </p>

        <Link
          to="/shop"
          className="primary-button"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="section-container checkout-page">
      <div className="page-heading">
        <span className="eyebrow">
          ROSÉVA SECURE CHECKOUT
        </span>

        <h1>Complete Your Order</h1>

        <p>
          Enter your delivery details and choose a
          payment method.
        </p>

        {/* Customer login information */}
        {!authLoading && user && (
          <p style={{ color: "#38864a" }}>
            Signed in as{" "}
            <strong>{user.full_name}</strong>
            {" — "}
            {user.email}
          </p>
        )}

        {!authLoading && !user && (
          <p>
            Already have an account?{" "}
            <Link to="/login">
              Login
            </Link>
            {" "}to save your orders in My Orders.
          </p>
        )}
      </div>

      <div className="cart-layout">
        {/* Delivery and payment form */}
        <form
          onSubmit={handleSubmit}
          className="order-summary"
        >
          <h2>Delivery Information</h2>

          {[
            ["full_name", "Full Name"],
            ["email", "Email Address"],
            ["phone", "Phone Number"],
            ["address", "Full Address"],
            ["city", "City"],
            ["state", "State"],
            ["postal_code", "PIN Code"],
          ].map(([name, label]) => (
            <div
              className="filter-group"
              key={name}
              style={{ marginBottom: 15 }}
            >
              <label htmlFor={name}>
                {label}
              </label>

              <input
                id={name}
                name={name}
                type={
                  name === "email"
                    ? "email"
                    : name === "phone" ||
                        name === "postal_code"
                    ? "tel"
                    : "text"
                }
                value={form[name]}
                onChange={handleChange}
                required
                readOnly={
                  name === "email" && Boolean(user)
                }
                maxLength={
                  name === "postal_code"
                    ? 6
                    : undefined
                }
                pattern={
                  name === "postal_code"
                    ? "[0-9]{6}"
                    : undefined
                }
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  background:
                    name === "email" && user
                      ? "#f7f7f7"
                      : "#fff",
                }}
              />
            </div>
          ))}

          <h2>Payment Method</h2>

          <div
            style={{
              display: "grid",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {paymentOptions.map(
              ({
                value,
                label,
                description,
                Icon,
              }) => (
                <label
                  key={value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 15,
                    border:
                      paymentMethod === value
                        ? "2px solid #9b4265"
                        : "1px solid #ddd",
                    borderRadius: 8,
                    cursor: "pointer",
                    background:
                      paymentMethod === value
                        ? "#fff6fa"
                        : "#fff",
                  }}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={value}
                    checked={
                      paymentMethod === value
                    }
                    onChange={() => {
                      setPaymentMethod(value);
                      setError("");
                    }}
                  />

                  <Icon size={24} />

                  <span>
                    <strong>
                      {label}
                    </strong>

                    <small
                      style={{
                        display: "block",
                        marginTop: 4,
                      }}
                    >
                      {description}
                    </small>
                  </span>
                </label>
              )
            )}
          </div>

          <p className="checkout-note">
            <ShieldCheck size={16} /> Your
            order details are submitted securely
            to our server.
          </p>

          {/* Demo payment notice */}
          {paymentMethod !== "cod" && (
            <p className="checkout-note">
              Demo checkout: Selecting this
              option creates an unpaid order.
              No UPI or card transaction will
              take place.
            </p>
          )}

          {/* Error message */}
          {error && (
            <p
              role="alert"
              style={{
                color: "#b42318",
                marginBottom: 15,
              }}
            >
              {error}
            </p>
          )}

          {/* Place order */}
          <button
            type="submit"
            className="primary-button full-width"
            disabled={loading || authLoading}
          >
            {loading
              ? "Placing Order..."
              : authLoading
              ? "Loading..."
              : `Place Order — ₹${formatPrice(total)}`}
          </button>
        </form>

        {/* Order summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>

          {cart.map((item) => (
            <div
              key={`${item.id}-${item.selectedSize}`}
              className="summary-row"
            >
              <span>
                {item.name} (
                {item.selectedSize || "Free Size"})
                {" × "}
                {item.quantity}
              </span>

              <strong>
                ₹
                {formatPrice(
                  Number(item.price) *
                    item.quantity
                )}
              </strong>
            </div>
          ))}

          <div className="summary-row">
            <span>Subtotal</span>

            <strong>
              ₹{formatPrice(cartTotal)}
            </strong>
          </div>

          <div className="summary-row">
            <span>Shipping</span>

            <strong>
              {shipping === 0
                ? "FREE"
                : `₹${formatPrice(shipping)}`}
            </strong>
          </div>

          <div className="summary-row summary-total">
            <span>Total</span>

            <strong>
              ₹{formatPrice(total)}
            </strong>
          </div>

          <p className="checkout-note">
            Final pricing and stock availability
            are confirmed by Django when the
            order is submitted.
          </p>
        </div>
      </div>
    </main>
  );
}
