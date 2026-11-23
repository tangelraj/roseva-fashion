
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  // ==========================================
  // FORM STATE
  // ==========================================

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // ==========================================
  // HANDLE REGISTRATION
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const fullName = form.full_name.trim();
    const email = form.email.trim().toLowerCase();

    if (!fullName) {
      setError("Please enter your full name.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (form.password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        ...form,
        full_name: fullName,
        email,
      });

      // ======================================
      // OTP VERIFICATION REQUIRED
      // ======================================

      if (result.requires_verification) {
        const verificationEmail =
          result.email || email;

        navigate(
          `/verify-otp?email=${encodeURIComponent(
            verificationEmail
          )}`,
          {
            replace: true,
            state: {
              email: verificationEmail,
            },
          }
        );

        return;
      }

      // ======================================
      // EXISTING AUTHENTICATED RESPONSE
      // ======================================

      if (result.tokens?.access) {
        navigate("/my-account", {
          replace: true,
        });

        return;
      }

      setError(
        "Registration completed, but the server " +
        "did not return verification information."
      );

    } catch (err) {
      setError(
        err.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FORM FIELDS
  // ==========================================

  const fields = [
    {
      name: "full_name",
      label: "Full Name",
      type: "text",
      autoComplete: "name",
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      autoComplete: "email",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      autoComplete: "new-password",
    },
    {
      name: "confirm_password",
      label: "Confirm Password",
      type: "password",
      autoComplete: "new-password",
    },
  ];

  // ==========================================
  // COMPONENT
  // ==========================================

  return (
    <main className="section-container">
      <div
        className="order-summary"
        style={{
          maxWidth: 460,
          margin: "40px auto",
        }}
      >
        <h1>Create Account</h1>

        <p>Join Roséva Fashion</p>

        <p
          style={{
            fontSize: 14,
            color: "#666",
            marginBottom: 20,
          }}
        >
          Create your account and verify your email
          using a 6-digit OTP.
        </p>

        <form onSubmit={handleSubmit}>
          {fields.map(
            ({
              name,
              label,
              type,
              autoComplete,
            }) => (
              <div
                key={name}
                className="filter-group"
                style={{
                  marginBottom: 16,
                }}
              >
                <label htmlFor={name}>
                  {label}
                </label>

                <input
                  id={name}
                  name={name}
                  type={type}
                  autoComplete={autoComplete}
                  value={form[name]}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  minLength={
                    name.includes("password")
                      ? 8
                      : undefined
                  }
                  maxLength={
                    name === "full_name"
                      ? 150
                      : undefined
                  }
                  style={{
                    width: "100%",
                    padding: 12,
                  }}
                />
              </div>
            )
          )}

          {error && (
            <p
              role="alert"
              style={{
                color: "#d32f2f",
                marginBottom: 16,
                fontSize: 14,
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="primary-button full-width"
            disabled={loading}
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p
          style={{
            marginTop: 20,
          }}
        >
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
