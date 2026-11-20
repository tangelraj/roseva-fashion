
import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { useShop } from "../context/ShopContext";

export default function Cart() {
  const {
    cart,
    cartTotal,
    removeFromCart,
    updateQuantity,
  } = useShop();

  const shipping = cartTotal >= 1999 || cartTotal === 0 ? 0 : 99;
  const total = cartTotal + shipping;

  if (cart.length === 0) {
    return (
      <main className="section-container empty-state">
        <ShoppingBag size={55} />
        <h1>Your Shopping Cart is Empty</h1>
        <p>Discover something beautiful from our collection.</p>
        <Link to="/shop" className="primary-button">
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="section-container cart-page">
      <div className="page-heading">
        <span className="eyebrow">YOUR SELECTIONS</span>
        <h1>Shopping Cart</h1>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.map((item) => (
            <motion.div
              layout
              key={`${item.id}-${item.selectedSize}`}
              className="cart-item"
            >
              <img src={item.image} alt={item.name} />

              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p>Size: {item.selectedSize}</p>
                <p>Fabric: {item.fabric}</p>

                <strong>
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </strong>

                <div className="quantity-control">
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        item.selectedSize,
                        item.quantity - 1
                      )
                    }
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} />
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        item.selectedSize,
                        item.quantity + 1
                      )
                    }
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              <button
                className="icon-button remove-button"
                onClick={() =>
                  removeFromCart(item.id, item.selectedSize)
                }
                aria-label="Remove item"
              >
                <Trash2 size={20} />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <strong>₹{cartTotal.toLocaleString("en-IN")}</strong>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <strong>
              {shipping === 0 ? "FREE" : `₹${shipping}`}
            </strong>
          </div>

          <div className="summary-row summary-total">
            <span>Total</span>
            <strong>₹{total.toLocaleString("en-IN")}</strong>
          </div>

          <Link
            to="/checkout"
            className="primary-button full-width"
          >
            Proceed to Checkout
          </Link>

          <p className="checkout-note">
            Cash on Delivery available. Secure order processing.
          </p>

          <Link to="/shop" className="continue-shopping">
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
