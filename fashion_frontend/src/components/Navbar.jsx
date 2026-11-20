
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  UserRound,
  Menu,
  X,
  LogOut,
  Package,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";

import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { cartCount, wishlist } = useShop();

  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    isActive ? "roseva-nav-link active" : "roseva-nav-link";

  return (
    <header className="roseva-header">
      <div className="roseva-topbar">
        Free shipping on orders above ₹1,999
      </div>

      <div className="roseva-navbar">
        <Link
          to="/"
          className="roseva-logo"
          onClick={closeMenu}
        >
          ROSÉVA
          <span>FASHION</span>
        </Link>

        <nav className="roseva-desktop-nav">
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>

          <NavLink to="/shop" className={navClass}>
            Shop
          </NavLink>

          <NavLink to="/wishlist" className={navClass}>
            Wishlist
          </NavLink>

          <NavLink to="/track-order" className={navClass}>
            Track Order
          </NavLink>
        </nav>

        <div className="roseva-nav-actions">
          {user ? (
            <div className="roseva-account-dropdown">
              <Link
                to="/my-account"
                className="roseva-icon-link"
                title="My Account"
              >
                <UserRound size={21} />
              </Link>

              <div className="roseva-account-menu">
                <p className="roseva-account-name">
                  {user.full_name || "My Account"}
                </p>

                <Link to="/my-account">
                  My Account
                </Link>

                <Link to="/my-orders">
                  <Package size={16} />
                  My Orders
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="roseva-icon-link"
              title="Customer Login"
            >
              <UserRound size={21} />
            </Link>
          )}

          <Link
            to="/wishlist"
            className="roseva-icon-link"
            title="Wishlist"
          >
            <Heart size={21} />

            {wishlist.length > 0 && (
              <span className="roseva-nav-count">
                {wishlist.length}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            className="roseva-icon-link"
            title="Shopping Cart"
          >
            <ShoppingBag size={21} />

            {cartCount > 0 && (
              <span className="roseva-nav-count">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="roseva-mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="roseva-mobile-nav">
          <Link to="/" onClick={closeMenu}>
            Home
          </Link>

          <Link to="/shop" onClick={closeMenu}>
            Shop
          </Link>

          <Link to="/wishlist" onClick={closeMenu}>
            Wishlist
          </Link>

          <Link to="/cart" onClick={closeMenu}>
            Cart ({cartCount})
          </Link>

          <Link to="/track-order" onClick={closeMenu}>
            Track Order
          </Link>

          {user ? (
            <>
              <Link to="/my-account" onClick={closeMenu}>
                My Account
              </Link>

              <Link to="/my-orders" onClick={closeMenu}>
                My Orders
              </Link>

              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu}>
                Login
              </Link>

              <Link to="/register" onClick={closeMenu}>
                Register
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
