
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { motion } from "motion/react";

import {
  getProducts,
  getCategories,
} from "../services/api";

import ProductCard from "../components/ProductCard";
import { getProductImage } from "../utils/imageUrl";

// Convert Django product data into frontend format
function normalizeProduct(product) {
  return {
    ...product,

    // Assign the correct image to each product
    image: getProductImage(product),

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

  // Read filters from URL
  const category = params.get("category") || "";
  const fabric = params.get("fabric") || "";
  const age = params.get("age") || "";
  const occasion = params.get("occasion") || "";
  const search = params.get("search") || "";
  const sort = params.get("sort") || "";

  const maxPrice = Number(
    params.get("maxPrice") || 10000
  );

  // Fetch products and categories from Django
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

        // Support normal arrays and paginated API responses
        const productList = Array.isArray(productData)
          ? productData
          : Array.isArray(productData?.results)
          ? productData.results
          : [];

        const categoryList = Array.isArray(categoryData)
          ? categoryData
          : Array.isArray(categoryData?.results)
          ? categoryData.results
          : [];

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

  // Update filter in URL
  const updateFilter = (key, value) => {
    const next = new URLSearchParams(params);

    if (value !== "" && value != null) {
      next.set(key, String(value));
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

      const matchesCategory =
        !category || productCategory === category;

      const matchesFabric =
        !fabric || material === fabric;

      const matchesAge =
        !age || product.ageGroup === age;

      const matchesOccasion =
        !occasion || product.occasion === occasion;

      const matchesPrice =
        product.price <= maxPrice;

      const matchesSearch =
        !search ||
        name.toLowerCase().includes(
          search.toLowerCase()
        ) ||
        material.toLowerCase().includes(
          search.toLowerCase()
        );

      return (
        matchesCategory &&
        matchesFabric &&
        matchesAge &&
        matchesOccasion &&
        matchesPrice &&
        matchesSearch
      );
    });

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sort === "newest") {
      result.sort(
        (a, b) =>
          Number(b.isNew) - Number(a.isNew)
      );
    }

    if (sort === "discount") {
      const getDiscount = (product) => {
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
        (a, b) =>
          getDiscount(b) - getDiscount(a)
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

  // Available fabrics
  const fabrics = useMemo(() => {
    return [
      ...new Set(
        products
          .map((product) => product.fabric)
          .filter(Boolean)
      ),
    ].sort();
  }, [products]);

  // Available occasions
  const occasions = useMemo(() => {
    return [
      ...new Set(
        products
          .map((product) => product.occasion)
          .filter(Boolean)
      ),
    ].sort();
  }, [products]);

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
            setShowFilters((previous) => !previous)
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
          onChange={(event) =>
            updateFilter("sort", event.target.value)
          }
          aria-label="Sort products"
        >
          <option value="">Featured</option>
          <option value="newest">
            New Arrivals
          </option>
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

          {/* CATEGORY FILTER */}
          <div className="filter-group">
            <label htmlFor="shop-category">
              Dress Category
            </label>

            <select
              id="shop-category"
              value={category}
              onChange={(event) =>
                updateFilter(
                  "category",
                  event.target.value
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

          {/* FABRIC FILTER */}
          <div className="filter-group">
            <label htmlFor="shop-fabric">
              Cloth Material
            </label>

            <select
              id="shop-fabric"
              value={fabric}
              onChange={(event) =>
                updateFilter(
                  "fabric",
                  event.target.value
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

          {/* AGE GROUP FILTER */}
          <div className="filter-group">
            <label htmlFor="shop-age">
              Age Group
            </label>

            <select
              id="shop-age"
              value={age}
              onChange={(event) =>
                updateFilter(
                  "age",
                  event.target.value
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

          {/* OCCASION FILTER */}
          <div className="filter-group">
            <label htmlFor="shop-occasion">
              Occasion
            </label>

            <select
              id="shop-occasion"
              value={occasion}
              onChange={(event) =>
                updateFilter(
                  "occasion",
                  event.target.value
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

          {/* PRICE FILTER */}
          <div className="filter-group">
            <label htmlFor="shop-max-price">
              Maximum Price: ₹
              {maxPrice.toLocaleString("en-IN")}
            </label>

            <input
              id="shop-max-price"
              type="range"
              min="500"
              max="10000"
              step="100"
              value={maxPrice}
              onChange={(event) =>
                updateFilter(
                  "maxPrice",
                  event.target.value
                )
              }
            />
          </div>

          {/* CLEAR ALL FILTERS */}
          <button
            type="button"
            className="outline-button full-width"
            onClick={() => setParams({})}
          >
            Clear All Filters
          </button>
        </aside>

        {/* PRODUCT RESULTS */}
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
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
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
