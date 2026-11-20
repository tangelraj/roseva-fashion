
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { motion, AnimatePresence } from "motion/react";

import {
  getHomepage,
  getCategories,
  getProducts,
} from "../services/api";

import {
  banners as fallbackBanners,
  categories as fallbackCategories,
  products as fallbackProducts,
} from "../data/catalog";

import ProductCard from "../components/ProductCard";
import AnnouncementBar from "../components/AnnouncementBar";

// ==========================================
// DEFAULT HOMEPAGE CONTENT
// ==========================================

const defaultSections = {
  categories: {
    eyebrow: "EXPLORE OUR COLLECTIONS",
    title: "Shop by Category",
    description:
      "Beautiful styles for every age and every occasion.",
    button_text: "Explore Collection",
    button_link: "/shop",
  },

  new_arrivals: {
    eyebrow: "FRESHLY CURATED",
    title: "New Arrivals",
    description:
      "Discover the latest styles you'll fall in love with.",
    button_text: "View All Products",
    button_link: "/shop?sort=newest",
  },

  featured: {
    eyebrow: "HANDPICKED FOR YOU",
    title: "Our Featured Collection",
    description:
      "Discover timeless outfits and beautiful everyday styles.",
  },

  newsletter: {
    eyebrow: "THE ROSÉVA EDIT",
    title: "Style That Tells Your Story",
    description:
      "Explore elegant ethnic fashion for women, teens, and little girls.",
    button_text: "Shop All Collections",
    button_link: "/shop",
  },
};

const defaultPromo = {
  eyebrow: "SPECIAL OCCASION EDIT",
  title: "Elegance for Every Celebration",
  description:
    "From wedding celebrations to festive gatherings, discover outfits made for unforgettable moments.",
  button_text: "Explore Wedding Edit",
  button_link: "/shop?occasion=Wedding",
  image: "/images/offers/festive-offer.jpg",
};

// ==========================================
// NORMALIZE PRODUCT DATA
// ==========================================

function normalizeProduct(product) {
  return {
    ...product,
    price: Number(product.price ?? 0),
    originalPrice:
      product.originalPrice == null
        ? null
        : Number(product.originalPrice),
    isNew: Boolean(product.isNew),
    isFeatured: Boolean(product.isFeatured),
    sizes: Array.isArray(product.sizes)
      ? product.sizes
      : [],
  };
}

// ==========================================
// HOME COMPONENT
// ==========================================

export default function Home() {
  // ========================================
  // STATE
  // ========================================

  const [activeSlide, setActiveSlide] = useState(0);

  const [banners, setBanners] = useState(fallbackBanners);

  const [categories, setCategories] = useState(
    fallbackCategories
  );

  const [products, setProducts] = useState(
    fallbackProducts
  );

  const [sections, setSections] = useState([]);

  const [promotions, setPromotions] = useState([]);

  const [benefits, setBenefits] = useState(null);

  const [apiError, setApiError] = useState(null);

  // ========================================
  // FETCH DATA FROM DJANGO ADMIN
  // ========================================

  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      console.log("ROSÉVA: Starting Django API requests");

      try {
        const [
          homepageData,
          categoryData,
          productData,
        ] = await Promise.all([
          getHomepage(),
          getCategories(),
          getProducts(),
        ]);

        if (cancelled) return;

        console.log(
          "DJANGO HOMEPAGE DATA:",
          homepageData
        );

        console.log(
          "DJANGO CATEGORIES:",
          categoryData
        );

        console.log(
          "DJANGO PRODUCTS:",
          productData
        );

        // HERO BANNERS
        setBanners(
          Array.isArray(homepageData?.banners)
            ? homepageData.banners
            : fallbackBanners
        );

        // CATEGORIES
        setCategories(
          Array.isArray(categoryData)
            ? categoryData
            : fallbackCategories
        );

        // PRODUCTS
        setProducts(
          Array.isArray(productData)
            ? productData.map(normalizeProduct)
            : fallbackProducts
        );

        // HOMEPAGE SECTIONS
        setSections(
          Array.isArray(homepageData?.sections)
            ? homepageData.sections
            : []
        );

        // PROMOTIONAL BANNERS
        setPromotions(
          Array.isArray(homepageData?.promotions)
            ? homepageData.promotions
            : []
        );

        // MOVING BENEFITS BAR
        setBenefits(
          Array.isArray(homepageData?.benefits)
            ? homepageData.benefits
            : null
        );

        setApiError(null);

        console.log(
          "ROSÉVA: Django Admin content loaded successfully"
        );
      } catch (error) {
        if (cancelled) return;

        console.error(
          "ROSÉVA: Django API connection failed:",
          error
        );

        setApiError(error.message);

        // Keep existing sample content visible
        // while the backend is unavailable.
      }
    }

    loadContent();

    return () => {
      cancelled = true;
    };
  }, []);

  // ========================================
  // GET HOMEPAGE SECTION
  // ========================================

  const getSection = (key) => {
    const section = sections.find(
      (item) => item.section_key === key
    );

    return {
      ...defaultSections[key],
      ...(section || {}),
    };
  };

  const categorySection = getSection("categories");
  const arrivalsSection = getSection("new_arrivals");
  const featuredSection = getSection("featured");
  const newsletterSection = getSection("newsletter");

  // ========================================
  // PROMOTIONAL BANNER
  // ========================================

  const promo =
    promotions.length > 0
      ? {
          ...defaultPromo,
          ...promotions[0],
          image:
            promotions[0].image ||
            defaultPromo.image,
        }
      : defaultPromo;

  // ========================================
  // HERO SLIDER
  // ========================================

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setActiveSlide(
        (previous) =>
          (previous + 1) % banners.length
      );
    }, 5500);

    return () => clearInterval(timer);
  }, [banners.length]);

  // Reset invalid slide index when banners change
  useEffect(() => {
    setActiveSlide((previous) => {
      if (banners.length === 0) return 0;

      return previous % banners.length;
    });
  }, [banners.length]);

  const changeSlide = (direction) => {
    if (banners.length <= 1) return;

    setActiveSlide(
      (previous) =>
        (previous + direction + banners.length) %
        banners.length
    );
  };

  const currentBanner = banners[activeSlide];

  // ========================================
  // PRODUCT SECTIONS
  // ========================================

  const newArrivals = products
    .filter((product) => product.isNew)
    .slice(0, 4);

  const featuredProducts = products
    .filter((product) => product.isFeatured)
    .slice(0, 4);

  // ========================================
  // RENDER
  // ========================================

  return (
    <main>
      {/* ====================================
          HERO SLIDER
      ==================================== */}

      {currentBanner && (
        <section className="hero-section">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner.id}
              className="hero-slide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.img
                src={currentBanner.image}
                alt={currentBanner.title}
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 5.5 }}
              />

              <div
                className="hero-overlay"
                style={
                  currentBanner.overlay_opacity != null
                    ? {
                        backgroundColor:
                          `rgba(0, 0, 0, ${
                            currentBanner.overlay_opacity
                          })`,
                      }
                    : undefined
                }
              />

              <div
                className="hero-content"
                style={
                  currentBanner.text_alignment
                    ? {
                        textAlign:
                          currentBanner.text_alignment,
                      }
                    : undefined
                }
              >
                <motion.span
                  className="eyebrow"
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {currentBanner.eyebrow}
                </motion.span>

                <motion.h1
                  initial={{ opacity: 0, y: 35 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  {currentBanner.title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {currentBanner.subtitle}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                >
                  <Link
                    to={
                      currentBanner.button_link ||
                      currentBanner.link ||
                      "/shop"
                    }
                    className="primary-button"
                  >
                    {currentBanner.button_text ||
                      "Shop Collection"}

                    <ArrowRight size={18} />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {banners.length > 1 && (
            <>
              <button
                type="button"
                className="hero-arrow hero-prev"
                onClick={() => changeSlide(-1)}
                aria-label="Previous banner"
              >
                <ChevronLeft />
              </button>

              <button
                type="button"
                className="hero-arrow hero-next"
                onClick={() => changeSlide(1)}
                aria-label="Next banner"
              >
                <ChevronRight />
              </button>

              <div className="hero-dots">
                {banners.map((banner, index) => (
                  <button
                    type="button"
                    key={banner.id}
                    className={
                      index === activeSlide
                        ? "active"
                        : ""
                    }
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Show banner ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* ====================================
          MOVING BENEFITS BAR
          BELOW HERO ONLY
      ==================================== */}

      <AnnouncementBar benefits={benefits} />

      {/* ====================================
          SHOP BY CATEGORY
      ==================================== */}

      <section className="section-container">
        <div className="section-heading">
          <span className="eyebrow">
            {categorySection.eyebrow}
          </span>

          <h2>{categorySection.title}</h2>

          <p>{categorySection.description}</p>
        </div>

        <div className="category-grid">
          {categories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.08,
              }}
            >
              <Link
                to={`/shop?category=${category.slug}`}
                className="category-card"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                />

                <div className="category-overlay">
                  <h3>{category.name}</h3>

                  <span>
                    {categorySection.button_text ||
                      "Explore Collection"}

                    <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ====================================
          NEW ARRIVALS
      ==================================== */}

      <section className="section-container arrivals-section">
        <div className="section-heading">
          <span className="eyebrow">
            {arrivalsSection.eyebrow}
          </span>

          <h2>{arrivalsSection.title}</h2>

          <p>{arrivalsSection.description}</p>
        </div>

        <div className="product-grid">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        <div className="center-button">
          <Link
            to={
              arrivalsSection.button_link ||
              "/shop?sort=newest"
            }
            className="outline-button"
          >
            {arrivalsSection.button_text ||
              "View All Products"}

            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ====================================
          PROMOTIONAL SECTION
      ==================================== */}

      <motion.section
        className="promo-section"
        style={
          promo.image
            ? {
                backgroundImage:
                  `url("${promo.image}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
        initial={{
          opacity: 0,
          scale: 0.97,
        }}
        whileInView={{
          opacity: 1,
          scale: 1,
        }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="promo-content">
          <span className="eyebrow">
            {promo.eyebrow}
          </span>

          <h2>{promo.title}</h2>

          <p>{promo.description}</p>

          <Link
            to={promo.button_link || "/shop"}
            className="primary-button"
          >
            {promo.button_text ||
              "Explore Collection"}

            <ArrowRight size={18} />
          </Link>
        </div>
      </motion.section>

      {/* ====================================
          FEATURED PRODUCTS
      ==================================== */}

      <section className="section-container">
        <div className="section-heading">
          <span className="eyebrow">
            {featuredSection.eyebrow}
          </span>

          <h2>{featuredSection.title}</h2>

          <p>{featuredSection.description}</p>
        </div>

        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </section>

      {/* ====================================
          NEWSLETTER / CTA
      ==================================== */}

      <section className="newsletter-section">
        <span className="eyebrow">
          {newsletterSection.eyebrow}
        </span>

        <h2>{newsletterSection.title}</h2>

        <p>{newsletterSection.description}</p>

        <Link
          to={
            newsletterSection.button_link ||
            "/shop"
          }
          className="primary-button"
        >
          {newsletterSection.button_text ||
            "Shop All Collections"}

          <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}
