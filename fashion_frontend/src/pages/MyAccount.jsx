
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MyAccount() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) return <p>Loading account...</p>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="section-container">
      <div className="page-heading">
        <span className="eyebrow">ROSÉVA FASHION</span>
        <h1>My Account</h1>
      </div>

      <div
        className="order-summary"
        style={{ maxWidth: 650, margin: "auto" }}
      >
        <h2>Welcome, {user.full_name}!</h2>

        <p>
          <strong>Name:</strong> {user.full_name}
        </p>

        <p>
          <strong>Email:</strong> {user.email}
        </p>

        <Link
          to="/my-orders"
          className="primary-button"
        >
          View My Orders
        </Link>

        <div style={{ marginTop: 24 }}>
          <button
            type="button"
            onClick={handleLogout}
            className="primary-button"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}
