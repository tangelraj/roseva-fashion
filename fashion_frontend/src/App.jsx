
import { Routes, Route } from "react-router-dom";

// Existing website components
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Existing website pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import TrackOrder from "./pages/TrackOrder";

// Customer authentication pages
import Register from "./pages/Register";
import Login from "./pages/Login";
import MyAccount from "./pages/MyAccount";
import MyOrders from "./pages/MyOrders";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import WhyChooseUs from "./pages/WhyChooseUs";
import "./pages/InfoPages.css";
import VerifyOTP from "./pages/VerifyOTP";

export default function App() {
  return (
    <>
      {/* Existing Django CMS-connected header */}
      <Header />

      {/* Website routes */}
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/shop" element={<Shop />} />

        <Route path="/cart" element={<Cart />} />

        <Route path="/wishlist" element={<Wishlist />} />

        <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

        <Route
          path="/order-success"
          element={<OrderSuccess />}
        />

        <Route
          path="/track-order"
          element={<TrackOrder />}
        />

        {/* Customer registration and login */}
        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/my-account"
          element={
            <ProtectedRoute>
              <MyAccount />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        {/* Fallback */}
        <Route path="*" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/why-choose-us" element={<WhyChooseUs />} />
      </Routes>

      {/* Existing Django CMS-connected footer */}
      <Footer />
    </>
  );
}
