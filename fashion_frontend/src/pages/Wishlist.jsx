
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useShop } from "../context/ShopContext";
import ProductCard from "../components/ProductCard";

export default function Wishlist() {
  const { wishlist } = useShop();

  return (
    <main className="section-container wishlist-page">
      <div className="page-heading">
        <span className="eyebrow">YOUR FAVOURITES</span>
        <h1>My Wishlist</h1>
        <p>All the beautiful styles you've saved.</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-state">
          <Heart size={55} />
          <h2>Your Wishlist is Empty</h2>
          <p>Save your favourite outfits by clicking the heart icon.</p>
          <Link to="/shop" className="primary-button">
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
