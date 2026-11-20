
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ShopContext = createContext(null);

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() =>
    readStorage("roseva_cart", [])
  );

  const [wishlist, setWishlist] = useState(() =>
    readStorage("roseva_wishlist", [])
  );

  useEffect(() => {
    localStorage.setItem("roseva_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(
      "roseva_wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  const addToCart = (product, size = null) => {
    const selectedSize =
      size || product.sizes?.[0] || "Free Size";

    const normalizedProduct = {
      ...product,
      price: Number(product.price || 0),
      originalPrice:
        product.originalPrice == null
          ? null
          : Number(product.originalPrice),
    };

    setCart((previous) => {
      const existing = previous.find(
        (item) =>
          item.id === product.id &&
          item.selectedSize === selectedSize
      );

      if (existing) {
        return previous.map((item) =>
          item.id === product.id &&
          item.selectedSize === selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...previous,
        {
          ...normalizedProduct,
          selectedSize,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (id, size) => {
    setCart((previous) =>
      previous.filter(
        (item) =>
          !(item.id === id && item.selectedSize === size)
      )
    );
  };

  const updateQuantity = (id, size, quantity) => {
    const nextQuantity = Math.floor(Number(quantity));

    if (!Number.isFinite(nextQuantity)) return;

    if (nextQuantity < 1) {
      removeFromCart(id, size);
      return;
    }

    setCart((previous) =>
      previous.map((item) =>
        item.id === id && item.selectedSize === size
          ? { ...item, quantity: nextQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (product) => {
    setWishlist((previous) =>
      previous.some((item) => item.id === product.id)
        ? previous.filter((item) => item.id !== product.id)
        : [...previous, product]
    );
  };

  const isWishlisted = (id) =>
    wishlist.some((item) => item.id === id);

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isWishlisted,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error(
      "useShop must be used inside ShopProvider"
    );
  }

  return context;
}
