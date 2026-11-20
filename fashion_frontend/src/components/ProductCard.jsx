
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { useShop } from "../context/ShopContext";

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useShop();

  const sizes = Array.isArray(product.sizes)
    ? product.sizes
    : [];

  const [selectedSize, setSelectedSize] = useState(
    sizes[0] || ""
  );

  const [added, setAdded] = useState(false);

  useEffect(() => {
    setSelectedSize(sizes[0] || "");
  }, [product.id, product.sizes]);

  const price = Number(product.price ?? 0);
  const originalPrice = Number(product.originalPrice ?? 0);

  const hasDiscount =
    originalPrice > 0 && originalPrice > price;

  const discount = hasDiscount
    ? Math.round(
        ((originalPrice - price) / originalPrice) * 100
      )
    : 0;

  const handleAdd = () => {
    addToCart(
      {
        ...product,
        price,
        originalPrice: hasDiscount ? originalPrice : null,
      },
      selectedSize
    );

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <motion.article
      className="product-card"
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <div className="product-image">
        <Link
          to={`/shop?search=${encodeURIComponent(product.name)}`}
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
          />
        </Link>

        {hasDiscount && (
          <span className="discount-badge">
            {discount}% OFF
          </span>
        )}

        <button
          type="button"
          className={`wishlist-button ${
            isWishlisted(product.id) ? "active" : ""
          }`}
          onClick={() => toggleWishlist(product)}
          aria-label="Toggle wishlist"
        >
          <Heart
            size={20}
            fill={
              isWishlisted(product.id)
                ? "currentColor"
                : "none"
            }
          />
        </button>
      </div>

      <div className="product-info">
        <span className="product-category">
          {[product.fabric, product.occasion]
            .filter(Boolean)
            .join(" · ")}
        </span>

        <h3>{product.name}</h3>

        <div className="product-price">
          <strong>
            ₹{price.toLocaleString("en-IN")}
          </strong>

          {hasDiscount && (
            <del>
              ₹{originalPrice.toLocaleString("en-IN")}
            </del>
          )}
        </div>

        <div className="product-actions">
          {sizes.length > 0 && (
            <select
              value={selectedSize}
              onChange={(event) =>
                setSelectedSize(event.target.value)
              }
              aria-label={`Select size for ${product.name}`}
            >
              {sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            className="add-cart-button"
            onClick={handleAdd}
          >
            <ShoppingBag size={16} />
            {added ? "Added!" : "Add to Cart"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
