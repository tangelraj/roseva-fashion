
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  UserRound,
  Instagram,
  Facebook,
  LogOut,
  Package,
  UserPlus,
  LogIn,
} from "lucide-react";

import { motion, AnimatePresence } from "motion/react";

import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import { getHomepage } from "../services/api";

const fallbackNavigation = [
  { id: 1, title: "New Arrivals", url: "/shop?sort=newest" },
  { id: 2, title: "Sarees", url: "/shop?category=sarees" },
  { id: 3, title: "Salwar Suits", url: "/shop?category=salwar" },
  { id: 4, title: "Frocks", url: "/shop?category=frocks" },
  { id: 5, title: "Kurtis", url: "/shop?category=kurtis" },
  { id: 6, title: "Gowns", url: "/shop?category=gowns" },
  { id: 7, title: "Lehengas", url: "/shop?category=lehengas" },
  { id: 8, title: "Sale", url: "/shop?sort=discount" },
];

const defaultWebsite = {
  site_name: "ROSÉVA",
  brand_tagline: "FASHION",
  logo: null,
  email: "support@example.com",
  instagram_url: "https://instagram.com",
  facebook_url: "https://facebook.com",
  top_bar_message: "Free shipping on orders above ₹1999",
  search_placeholder: "Search sarees, frocks, kurtis...",
};

export default function Header() {
  const navigate = useNavigate();

  // Shopping cart and wishlist
  const { cartCount, wishlist } = useShop();

  // Customer authentication
  const { user, logout } = useAuth();

  // Header state
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Django CMS data
  const [website, setWebsite] = useState(defaultWebsite);
  const [navigation, setNavigation] = useState(
    fallbackNavigation
  );

  // Load Django Admin website settings and navigation
  useEffect(() => {
    let cancelled = false;

    async function loadHeader() {
      try {
        const data = await getHomepage();

        if (cancelled) return;

        if (data.website) {
          setWebsite({
            ...defaultWebsite,
            ...data.website,
          });
        }

        if (Array.isArray(data.navigation)) {
          setNavigation(
            data.navigation
              .filter(
                (item) => item.is_active !== false
              )
              .sort(
                (a, b) =>
                  (a.display_order ?? 0) -
                  (b.display_order ?? 0)
              )
          );
        }
      } catch (error) {
        console.error("Header API error:", error);
      }
    }

    loadHeader();

    return () => {
      cancelled = true;
    };
  }, []);

  // Close menus after navigation
  const closeMenus = () => {
    setMenuOpen(false);
    setAccountOpen(false);
    setSearchOpen(false);
  };

  // Search products
  const handleSearch = (event) => {
    event.preventDefault();

    if (!search.trim()) return;

    navigate(
      `/shop?search=${encodeURIComponent(
        search.trim()
      )}`
    );

    setSearch("");
    closeMenus();
  };

  // Logout customer
  const handleLogout = () => {
    logout();
    closeMenus();
    navigate("/login");
  };

  // Account icon behavior
  const handleAccountClick = () => {
    if (!user) {
      closeMenus();
      navigate("/login");
      return;
    }

    setAccountOpen((previous) => !previous);
    setSearchOpen(false);
    setMenuOpen(false);
  };

  // Logo from Django Admin
  const brand = (
    <>
      {website.logo ? (
        <img
          src={website.logo}
          alt={
            website.site_name ||
            "Roséva Fashion"
          }
          className="brand-image"
          style={{
            maxHeight: 48,
            maxWidth: 170,
            objectFit: "contain",
          }}
        />
      ) : (
        <>
          {website.site_name || "ROSÉVA"}

          <small>
            {website.brand_tagline || "FASHION"}
          </small>
        </>
      )}
    </>
  );

  return (
    <header className="site-header">
      {/* Top bar */}
      <div className="top-bar">
        <div className="top-socials">
          {website.instagram_url && (
            <a
              href={website.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Instagram size={17} />
            </a>
          )}

          {website.facebook_url && (
            <a
              href={website.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <Facebook size={17} />
            </a>
          )}
        </div>

        <span>
          {website.top_bar_message}
        </span>

        <div className="top-links">
          <Link to="/track-order">
            Track Order
          </Link>

          {website.email && (
            <a href={`mailto:${website.email}`}>
              Contact Us
            </a>
          )}
        </div>
      </div>

      {/* Main navbar */}
      <div className="navbar">
        <Link
          to="/"
          className="brand-logo"
          onClick={closeMenus}
        >
          {brand}
        </Link>

        {/* Django Admin navigation */}
        <nav className="desktop-nav">
          {navigation.map((item) => (
            <Link
              key={item.id ?? item.url}
              to={item.url || "/shop"}
              onClick={closeMenus}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Right-side actions */}
        <div className="nav-actions">
          {/* Search */}
          <button
            type="button"
            className="icon-button"
            onClick={() => {
              setSearchOpen(!searchOpen);
              setAccountOpen(false);
            }}
            aria-label="Search products"
          >
            <Search size={22} />
          </button>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="icon-button badge-wrapper"
            aria-label="Wishlist"
            onClick={closeMenus}
          >
            <Heart size={22} />

            {wishlist.length > 0 && (
              <span className="count-badge">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="icon-button badge-wrapper"
            aria-label="Shopping cart"
            onClick={closeMenus}
          >
            <ShoppingBag size={22} />

            <span className="count-badge">
              {cartCount}
            </span>
          </Link>

          {/* Customer account */}
          <div className="roseva-user-menu-wrapper">
            <button
              type="button"
              className="icon-button account-button"
              onClick={handleAccountClick}
              aria-label={
                user
                  ? "Customer account"
                  : "Customer login"
              }
              aria-expanded={
                user ? accountOpen : undefined
              }
              title={
                user
                  ? "My Account"
                  : "Login / Register"
              }
            >
              <UserRound size={22} />
            </button>

            {/* Dropdown for logged-in customers */}
            {user && accountOpen && (
              <div className="roseva-user-dropdown">
                <div className="roseva-user-info">
                  <strong>
                    {user.full_name ||
                      "Customer"}
                  </strong>

                  <small>
                    {user.email}
                  </small>
                </div>

                <Link
                  to="/my-account"
                  onClick={closeMenus}
                >
                  <UserRound size={17} />
                  My Account
                </Link>

                <Link
                  to="/my-orders"
                  onClick={closeMenus}
                >
                  <Package size={17} />
                  My Orders
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="icon-button mobile-menu-button"
            onClick={() => {
              setMenuOpen(!menuOpen);
              setAccountOpen(false);
              setSearchOpen(false);
            }}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Search panel */}
      <AnimatePresence>
        {searchOpen && (
          <motion.form
            initial={{
              opacity: 0,
              y: -12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -12,
            }}
            className="search-panel"
            onSubmit={handleSearch}
          >
            <input
              autoFocus
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={
                website.search_placeholder ||
                "Search products..."
              }
            />

            <button
              type="submit"
              aria-label="Submit search"
            >
              <Search size={20} />
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Mobile navigation */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="mobile-nav"
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
          >
            {navigation.map((item) => (
              <Link
                key={item.id ?? item.url}
                to={item.url || "/shop"}
                onClick={closeMenus}
              >
                {item.title}
              </Link>
            ))}

            <Link
              to="/track-order"
              onClick={closeMenus}
            >
              Track Order
            </Link>

            {/* Customer links */}
            {user ? (
              <>
                <Link
                  to="/my-account"
                  onClick={closeMenus}
                >
                  <UserRound size={17} />
                  My Account
                </Link>

                <Link
                  to="/my-orders"
                  onClick={closeMenus}
                >
                  <Package size={17} />
                  My Orders
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenus}
                >
                  <LogIn size={17} />
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenus}
                >
                  <UserPlus size={17} />
                  Register
                </Link>
              </>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
