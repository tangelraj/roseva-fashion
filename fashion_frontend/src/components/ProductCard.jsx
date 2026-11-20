
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";

import { useShop } from "../context/ShopContext";
import { getImageUrl } from "../utils/imageUrl";

export default function ProductCard({ product }) {
  const {
    addToCart,
    toggleWishlist,
    isWishlisted,
  } = useShop();

  const sizes = Array.isArray(product.sizes)
    ? product.sizes
    : [];

  const [selectedSize, setSelectedSize] = useState(
    sizes[0] || ""
  );

  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const timeoutRef = useRef(null);

  useEffect(() => {
    setSelectedSize(sizes[0] || "");
  }, [product.id, product.sizes]);

  useEffect(() => {
    setImageError(false);
  }, [product.id, product.image]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Get image from Django product data
  const rawImage =
    product.image ||
    product.image_url ||
    product.primary_image ||
    product.images?.[0]?.image ||
    product.images?.[0]?.url ||
    "";

  const imageUrl = getImageUrl(rawImage);

  // Local fallback image
  const fallbackImage = "/images/products/product-1.webp";

  const displayImage =
    !imageError && imageUrl
      ? imageUrl
      : fallbackImage;

  const price = Number(product.price ?? 0);

  const originalPrice = Number(
    product.originalPrice ?? 0
  );

  const hasDiscount =
    originalPrice > 0 &&
    originalPrice > price;

  const discount = hasDiscount
    ? Math.round(
        ((originalPrice - price) / originalPrice) * 100
      )
    : 0;

  const wishlisted = isWishlisted(product.id);

  const handleAdd = () => {
    addToCart(
      {
        ...product,
        image: displayImage,
        price,
        originalPrice: hasDiscount
          ? originalPrice
          : null,
      },
      selectedSize
    );

    setAdded(true);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setAdded(false);
    }, 1200);
  };

  return (
    <motion.article
      className="product-card"
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{
        once: true,
        amount: 0.1,
      }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      {/* PRODUCT IMAGE */}
      <div className="product-image">
        <Link
          to={`/shop?search=${encodeURIComponent(
            product.name || ""
          )}`}
        >
          <img
            src={displayImage}
            alt={product.name || "Fashion product"}
            loading="lazy"
            onError={() => {
              if (!imageError) {
                setImageError(true);
              }
            }}
          />
        </Link>

        {/* DISCOUNT BADGE */}
        {hasDiscount && (
          <span className="discount-badge">
            {discount}% OFF
          </span>
        )}

        {/* WISHLIST BUTTON */}
        <button
          type="button"
          className={`wishlist-button ${
            wishlisted ? "active" : ""
          }`}
          onClick={() => toggleWishlist(product)}
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
        >
          <Heart
            size={20}
            fill={
              wishlisted
                ? "currentColor"
                : "none"
            }
          />
        </button>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="product-info">
        <span className="product-category">
          {[
            product.fabric,
            product.occasion,
          ]
            .filter(Boolean)
            .join(" · ")}
        </span>

        <h3>{product.name}</h3>

        {/* PRICE */}
        <div className="product-price">
          <strong>
            ₹{price.toLocaleString("en-IN")}
          </strong>

          {hasDiscount && (
            <del>
              ₹{originalPrice.toLocaleString(
                "en-IN"
              )}
            </del>
          )}
        </div>

        {/* CART ACTIONS */}
        <div className="product-actions">
          {sizes.length > 0 && (
            <select
              value={selectedSize}
              onChange={(event) =>
                setSelectedSize(
                  event.target.value
                )
              }
              aria-label={`Select size for ${product.name}`}
            >
              {sizes.map((size) => (
                <option
                  key={size}
                  value={size}
                >
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

            {added
              ? "Added!"
              : "Add to Cart"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
