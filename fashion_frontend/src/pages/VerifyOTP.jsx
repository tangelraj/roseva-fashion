
import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const RESEND_COOLDOWN = 60;

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const { verifyOTP, resendOTP } = useAuth();

  // ==========================================
  // CUSTOMER EMAIL
  // ==========================================

  const email = (
    location.state?.email ||
    searchParams.get("email") ||
    ""
  ).trim();

  // ==========================================
  // COMPONENT STATE
  // ==========================================

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Cooldown starts when registration sends
  // the initial OTP.
  const [cooldown, setCooldown] = useState(
    email ? RESEND_COOLDOWN : 0
  );

  // ==========================================
  // RESEND COUNTDOWN
  // ==========================================

  useEffect(() => {
    if (cooldown <= 0) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setCooldown((previous) =>
        Math.max(0, previous - 1)
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleVerify = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setMessage("");

    if (!email) {
      setError(
        "Email address is missing. Please register again."
      );
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const result = await verifyOTP(email, otp);

      if (!result.verified) {
        throw new Error(
          "Email verification was not confirmed."
        );
      }

      setMessage(
        "Email verified successfully! Redirecting to login..."
      );

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Email verified successfully. Please log in.",
        },
      });

    } catch (err) {
      if (err.status === 429) {
        setError(
          "Too many verification attempts. Please wait before trying again."
        );
      } else {
        setError(
          err.message ||
          "OTP verification failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RESEND OTP
  // ==========================================

  const handleResend = async () => {
    if (
      resending ||
      loading ||
      cooldown > 0 ||
      !email
    ) {
      return;
    }

    setError("");
    setMessage("");
    setResending(true);

    try {
      const result = await resendOTP(email);

      setMessage(
        result.message ||
        "OTP request completed. Please check your email."
      );

      setOtp("");

      setCooldown(
        Number(result.retry_after) > 0
          ? Number(result.retry_after)
          : RESEND_COOLDOWN
      );

    } catch (err) {
      if (err.status === 429) {
        const retryAfter = Number(
          err.data?.retry_after
        );

        if (
          Number.isFinite(retryAfter) &&
          retryAfter > 0
        ) {
          setCooldown(Math.ceil(retryAfter));
        } else {
          setCooldown(RESEND_COOLDOWN);
        }

        setError(
          err.message ||
          "Please wait before requesting another OTP."
        );
      } else {
        setError(
          err.message ||
          "Unable to resend OTP. Please try again."
        );
      }
    } finally {
      setResending(false);
    }
  };

  // ==========================================
  // OTP INPUT CHANGE
  // ==========================================

  const handleOTPChange = (event) => {
    const value = event.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(value);

    if (error) {
      setError("");
    }
  };

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
          padding: 30,
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 25,
          }}
        >
          <div
            style={{
              fontSize: 40,
              marginBottom: 12,
            }}
            aria-hidden="true"
          >
            ✉️
          </div>

          <h1>Verify Your Email</h1>

          <p
            style={{
              color: "#666",
              marginTop: 10,
              lineHeight: 1.6,
            }}
          >
            Enter the 6-digit verification code
            sent to your email address.
          </p>

          {email && (
            <p
              style={{
                fontWeight: 600,
                marginTop: 10,
                overflowWrap: "anywhere",
              }}
            >
              {email}
            </p>
          )}
        </div>

        {!email ? (
          <div>
            <p
              role="alert"
              style={{
                color: "#d32f2f",
                textAlign: "center",
              }}
            >
              Email address not found.
              Please return to registration.
            </p>

            <Link to="/register">
              Back to Registration
            </Link>
          </div>
        ) : (
          <>
            {/* ==================================
                VERIFY OTP FORM
            ================================== */}

            <form onSubmit={handleVerify}>
              <div
                className="filter-group"
                style={{
                  marginBottom: 18,
                }}
              >
                <label htmlFor="verification-otp">
                  Verification Code
                </label>

                <input
                  id="verification-otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otp}
                  onChange={handleOTPChange}
                  placeholder="Enter 6-digit OTP"
                  required
                  disabled={loading || resending}
                  style={{
                    width: "100%",
                    padding: 14,
                    fontSize: 22,
                    textAlign: "center",
                    letterSpacing: 8,
                    fontWeight: 600,
                  }}
                />
              </div>

              <p
                style={{
                  fontSize: 13,
                  color: "#777",
                  textAlign: "center",
                  marginBottom: 18,
                }}
              >
                Your OTP is valid for 5 minutes.
              </p>

              {error && (
                <p
                  role="alert"
                  style={{
                    color: "#d32f2f",
                    background: "#fff1f1",
                    padding: 12,
                    borderRadius: 6,
                    marginBottom: 15,
                  }}
                >
                  {error}
                </p>
              )}

              {message && (
                <p
                  role="status"
                  style={{
                    color: "#176b39",
                    background: "#edf9f0",
                    padding: 12,
                    borderRadius: 6,
                    marginBottom: 15,
                  }}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="primary-button full-width"
                disabled={
                  loading ||
                  resending ||
                  otp.length !== 6
                }
                style={{
                  opacity:
                    loading ||
                    resending ||
                    otp.length !== 6
                      ? 0.65
                      : 1,
                }}
              >
                {loading
                  ? "Verifying OTP..."
                  : "Verify Email"}
              </button>
            </form>

            {/* ==================================
                RESEND OTP
            ================================== */}

            <div
              style={{
                textAlign: "center",
                marginTop: 25,
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  color: "#666",
                  marginBottom: 10,
                }}
              >
                Didn't receive the OTP?
              </p>

              <button
                type="button"
                onClick={handleResend}
                disabled={
                  resending ||
                  loading ||
                  cooldown > 0
                }
                style={{
                  background: "transparent",
                  border: "none",
                  color:
                    cooldown > 0
                      ? "#888"
                      : "#b45c76",
                  fontWeight: 600,
                  cursor:
                    cooldown > 0
                      ? "not-allowed"
                      : "pointer",
                  padding: 8,
                }}
              >
                {resending
                  ? "Sending OTP..."
                  : cooldown > 0
                    ? `Resend OTP in ${cooldown}s`
                    : "Resend OTP"}
              </button>
            </div>

            {/* ==================================
                LOGIN LINK
            ================================== */}

            <p
              style={{
                marginTop: 25,
                textAlign: "center",
                fontSize: 14,
              }}
            >
              Already verified?{" "}
              <Link to="/login">
                Login
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
