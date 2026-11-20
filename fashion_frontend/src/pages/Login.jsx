
import { useState } from "react";
import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Return customer to the page they originally requested.
  // Default destination: My Account.
  const requestedPath = location.state?.from;

  const redirectTo =
    typeof requestedPath === "string" &&
    requestedPath.startsWith("/") &&
    !requestedPath.startsWith("//") &&
    !requestedPath.startsWith("/login")
      ? requestedPath
      : "/my-account";

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      // Authenticate customer
      await login(
        email.trim().toLowerCase(),
        password
      );

      // Return to checkout if customer came from checkout
      navigate(redirectTo, {
        replace: true,
      });
    } catch (err) {
      setError(
        err?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="section-container">
      <div
        className="order-summary"
        style={{
          maxWidth: 460,
          margin: "40px auto",
          padding: 30,
          borderRadius: 14,
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Customer Login
        </h1>

        <p
          style={{
            textAlign: "center",
            marginBottom: 25,
            color: "#777",
          }}
        >
          Welcome back to Roséva Fashion
        </p>

        {redirectTo === "/checkout" && (
          <p
            style={{
              background: "#fff0f4",
              padding: 12,
              borderRadius: 8,
              textAlign: "center",
              marginBottom: 20,
              color: "#9c3d5b",
              fontSize: 14,
            }}
          >
            Please log in to continue to checkout.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div
            className="filter-group"
            style={{ marginBottom: 18 }}
          >
            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              disabled={loading}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
              }}
            />
          </div>

          {/* Password */}
          <div
            className="filter-group"
            style={{ marginBottom: 20 }}
          >
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              disabled={loading}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <p
              role="alert"
              style={{
                color: "#b42318",
                background: "#fff1f0",
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 14,
              }}
            >
              {error}
            </p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="primary-button full-width"
            disabled={loading}
            style={{
              width: "100%",
              padding: 14,
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "Logging In..."
              : "Login"}
          </button>
        </form>

        {/* Registration */}
        <p
          style={{
            marginTop: 24,
            textAlign: "center",
            fontSize: 14,
          }}
        >
          New customer?{" "}
          <Link
            to="/register"
            state={{
              from: redirectTo,
            }}
            style={{
              color: "#b8466b",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Create Account
          </Link>
        </p>

        {/* Back to shopping */}
        <p
          style={{
            textAlign: "center",
            marginTop: 14,
          }}
        >
          <Link
            to="/shop"
            style={{
              color: "#777",
              textDecoration: "none",
              fontSize: 13,
            }}
          >
            ← Continue Shopping
          </Link>
        </p>
      </div>
    </main>
  );
}
