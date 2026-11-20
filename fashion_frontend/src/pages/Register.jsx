
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register(form);
      navigate("/my-account", { replace: true });
    } catch (err) {
      setError(err.message);
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
        }}
      >
        <h1>Create Account</h1>
        <p>Join Roséva Fashion</p>

        <form onSubmit={handleSubmit}>
          {[
            ["full_name", "Full Name", "text"],
            ["email", "Email Address", "email"],
            ["password", "Password", "password"],
            [
              "confirm_password",
              "Confirm Password",
              "password",
            ],
          ].map(([name, label, type]) => (
            <div
              key={name}
              className="filter-group"
              style={{ marginBottom: 16 }}
            >
              <label htmlFor={name}>{label}</label>
              <input
                id={name}
                name={name}
                type={type}
                value={form[name]}
                onChange={handleChange}
                required
                minLength={
                  name.includes("password") ? 8 : undefined
                }
                style={{
                  width: "100%",
                  padding: 12,
                }}
              />
            </div>
          ))}

          {error && (
            <p role="alert" style={{ color: "red" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="primary-button full-width"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p style={{ marginTop: 20 }}>
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </main>
  );
}
