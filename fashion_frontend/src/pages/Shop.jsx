
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { motion } from "motion/react";

import {
  getProducts,
  getCategories,
} from "../services/api";

import ProductCard from "../components/ProductCard";
import { getImageUrl } from "../utils/imageUrl";

// Normalize products received from Django
function normalizeProduct(product) {
  const rawImage =
    product.image ||
    product.image_url ||
    product.primary_image ||
    product.images?.[0]?.image ||
    product.images?.[0]?.url ||
    "";

  return {
    ...product,

    image: getImageUrl(rawImage),

    price: Number(product.price ?? 0),

    originalPrice:
      product.originalPrice == null
        ? null
        : Number(product.originalPrice),

    sizes: Array.isArray(product.sizes)
      ? product.sizes
      : [],

    isNew: Boolean(product.isNew),
    isFeatured: Boolean(product.isFeatured),
  };
}

export default function Shop() {
  const [params, setParams] = useSearchParams();

  const [showFilters, setShowFilters] = useState(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // URL filters
  const category = params.get("category") || "";
  const fabric = params.get("fabric") || "";
  const age = params.get("age") || "";
  const occasion = params.get("occasion") || "";
  const search = params.get("search") || "";
  const sort = params.get("sort") || "";

  const maxPrice = Number(
    params.get("maxPrice") || 10000
  );

  // Load Django products and categories
  useEffect(() => {
    let cancelled = false;

    async function loadShop() {
      setLoading(true);

      try {
        const [productData, categoryData] =
          await Promise.all([
            getProducts(),
            getCategories(),
          ]);

        if (cancelled) return;

        const productList = Array.isArray(productData)
          ? productData
          : productData?.results || [];

        const categoryList = Array.isArray(categoryData)
          ? categoryData
          : categoryData?.results || [];

        const normalizedProducts =
          productList.map(normalizeProduct);

        console.log(
          "ROSÉVA PRODUCTS:",
          normalizedProducts
        );

        console.log(
          "ROSÉVA CATEGORIES:",
          categoryList
        );

        setProducts(normalizedProducts);
        setCategories(categoryList);

        setError("");
      } catch (err) {
        if (cancelled) return;

        console.error("Shop API error:", err);

        setError(
          "Unable to load products. Please try again."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadShop();

    return () => {
      cancelled = true;
    };
  }, []);

  // Update URL query parameters
  const updateFilter = (key, value) => {
    const next = new URLSearchParams(params);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    setParams(next);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const name = String(product.name || "");
      const material = String(product.fabric || "");

      const productCategory =
        typeof product.category === "object"
          ? product.category?.slug
          : product.category;

      return (
        (!category || productCategory === category) &&
        (!fabric || material === fabric) &&
        (!age || product.ageGroup === age) &&
        (!occasion || product.occasion === occasion) &&
        product.price <= maxPrice &&
        (!search ||
          name
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          material
            .toLowerCase()
            .includes(search.toLowerCase()))
      );
    });

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === "newest") {
      result.sort(
        (a, b) =>
          Number(b.isNew) - Number(a.isNew)
      );
    } else if (sort === "discount") {
      const discount = (product) => {
        if (
          !product.originalPrice ||
          product.originalPrice <= product.price
        ) {
          return 0;
        }

        return (
          (product.originalPrice - product.price) /
          product.originalPrice
        );
      };

      result.sort(
        (a, b) => discount(b) - discount(a)
      );
    }

    return result;
  }, [
    products,
    category,
    fabric,
    age,
    occasion,
    search,
    sort,
    maxPrice,
  ]);

  const fabrics = useMemo(
    () =>
      [
        ...new Set(
          products.map((p) => p.fabric).filter(Boolean)
        ),
      ].sort(),
    [products]
  );

  const occasions = useMemo(
    () =>
      [
        ...new Set(
          products.map((p) => p.occasion).filter(Boolean)
        ),
      ].sort(),
    [products]
  );

  return (
    <main className="shop-page section-container">
      {/* PAGE HEADING */}
      <div className="page-heading">
        <span className="eyebrow">
          THE ROSÉVA COLLECTION
        </span>

        <h1>Shop Our Collection</h1>

        <p>
          Find your perfect outfit for every occasion.
        </p>
      </div>

      {/* SHOP TOOLBAR */}
      <div className="shop-toolbar">
        <button
          type="button"
          className="outline-button mobile-filter-button"
          onClick={() =>
            setShowFilters(!showFilters)
          }
        >
          <SlidersHorizontal size={18} />
          Filters
        </button>

        <span>
          {loading
            ? "Loading products..."
            : `${filteredProducts.length} Products`}
        </span>

        <select
          value={sort}
          onChange={(e) =>
            updateFilter("sort", e.target.value)
          }
          aria-label="Sort products"
        >
          <option value="">Featured</option>
          <option value="newest">New Arrivals</option>
          <option value="price-low">
            Price: Low to High
          </option>
          <option value="price-high">
            Price: High to Low
          </option>
          <option value="discount">
            Highest Discount
          </option>
        </select>
      </div>

      <div className="shop-layout">
        {/* FILTER SIDEBAR */}
        <aside
          className={`filter-sidebar ${
            showFilters ? "open" : ""
          }`}
        >
          <div className="filter-title">
            <h3>Filters</h3>

            <button
              type="button"
              className="icon-button"
              onClick={() =>
                setShowFilters(false)
              }
              aria-label="Close filters"
            >
              <X size={20} />
            </button>
          </div>

          {/* CATEGORY */}
          <div className="filter-group">
            <label>Dress Category</label>

            <select
              value={category}
              onChange={(e) =>
                updateFilter(
                  "category",
                  e.target.value
                )
              }
            >
              <option value="">
                All Categories
              </option>

              {categories.map((item) => (
                <option
                  key={item.slug}
                  value={item.slug}
                >
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* FABRIC */}
          <div className="filter-group">
            <label>Cloth Material</label>

            <select
              value={fabric}
              onChange={(e) =>
                updateFilter(
                  "fabric",
                  e.target.value
                )
              }
            >
              <option value="">
                All Fabrics
              </option>

              {fabrics.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* AGE */}
          <div className="filter-group">
            <label>Age Group</label>

            <select
              value={age}
              onChange={(e) =>
                updateFilter(
                  "age",
                  e.target.value
                )
              }
            >
              <option value="">
                All Ages
              </option>

              <option value="Kids">
                Kids (0–12 years)
              </option>

              <option value="Teens">
                Teen Girls (13–17 years)
              </option>

              <option value="Women">
                Women (18+)
              </option>
            </select>
          </div>

          {/* OCCASION */}
          <div className="filter-group">
            <label>Occasion</label>

            <select
              value={occasion}
              onChange={(e) =>
                updateFilter(
                  "occasion",
                  e.target.value
                )
              }
            >
              <option value="">
                All Occasions
              </option>

              {occasions.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* PRICE */}
          <div className="filter-group">
            <label>
              Maximum Price: ₹
              {maxPrice.toLocaleString("en-IN")}
            </label>

            <input
              type="range"
              min="500"
              max="10000"
              step="100"
              value={maxPrice}
              onChange={(e) =>
                updateFilter(
                  "maxPrice",
                  e.target.value
                )
              }
            />
          </div>

          {/* CLEAR FILTERS */}
          <button
            type="button"
            className="outline-button full-width"
            onClick={() => setParams({})}
          >
            Clear All Filters
          </button>
        </aside>

        {/* PRODUCTS */}
        <section className="shop-results">
          {loading ? (
            <div className="empty-state">
              <h2>Loading products...</h2>
              <p>
                Please wait while we load
                the collection.
              </p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <h2>
                Unable to load products
              </h2>

              <p>{error}</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <motion.div
              layout
              className="product-grid"
            >
              {filteredProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                )
              )}
            </motion.div>
          ) : (
            <div className="empty-state">
              <h2>No dresses found</h2>

              <p>
                Try changing your filters
                or search terms.
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={() => setParams({})}
              >
                Show All Products
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
