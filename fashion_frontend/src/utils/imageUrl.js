
const BACKEND_URL = "https://roseva-fashion.onrender.com";

// Existing product images in public/images/products/
const PRODUCT_IMAGES = {
  "rose pink silk saree": "/images/products/product-1.webp",
  "cream embroidered salwar suit": "/images/products/product-2.webp",
  "girls floral party frock": "/images/products/product-3.avif",
  "cotton printed kurti": "/images/products/product-4.webp",
  "maroon festive gown": "/images/products/product-5.jpg",
  "rose gold designer lehenga": "/images/products/product-6.webp",
  "georgette designer saree": "/images/products/product-7.webp",
  "girls cotton casual frock": "/images/products/product-8.webp",
};

// Convert Django image paths to usable frontend URLs
export function getImageUrl(image) {
  if (!image) return "";

  const value =
    typeof image === "string"
      ? image
      : image.url || image.image || "";

  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const imagePath = value.trim();

  if (imagePath.startsWith("data:")) {
    return imagePath;
  }

  // Absolute URLs from Cloudinary or Django
  if (/^https?:\/\//i.test(imagePath)) {
    try {
      const url = new URL(imagePath);

      // Convert legacy Render media URLs to local images
      if (
        url.hostname === "roseva-fashion.onrender.com" &&
        url.pathname.startsWith("/media/")
      ) {
        return `/images/${url.pathname.slice(7)}`;
      }

      return imagePath;
    } catch {
      return "";
    }
  }

  // Relative Django media or React public paths
  const path = imagePath
    .replace(/^\/+/, "")
    .replace(/^media\//, "")
    .replace(/^images\//, "");

  if (/^(products|categories|banners|offers)\//.test(path)) {
    return `/images/${path}`;
  }

  return `${BACKEND_URL}/${imagePath.replace(/^\/+/, "")}`;
}

// Get the correct image for each product
export function getProductImage(product) {
  const name = String(product?.name || "")
    .trim()
    .toLowerCase();

  const rawImage =
    product?.image ||
    product?.image_url ||
    product?.primary_image ||
    product?.images?.[0]?.image ||
    product?.images?.[0]?.url ||
    "";

  // Prefer a real externally hosted image
  if (typeof rawImage === "string" && /^https?:\/\//i.test(rawImage)) {
    try {
      const url = new URL(rawImage);

      if (
        !(
          url.hostname === "roseva-fashion.onrender.com" &&
          url.pathname.startsWith("/media/")
        )
      ) {
        return rawImage;
      }
    } catch {
      // Continue to local image mapping
    }
  }

  // Use the correct local image for existing products
  if (PRODUCT_IMAGES[name]) {
    return PRODUCT_IMAGES[name];
  }

  // Otherwise use the image provided by Django
  return getImageUrl(rawImage);
}
