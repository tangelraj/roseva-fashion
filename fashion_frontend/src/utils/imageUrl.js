
const BACKEND_URL =
  "https://roseva-fashion.onrender.com";

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

  // Cloudinary or other external image URLs
  if (/^https?:\/\//i.test(imagePath)) {
    try {
      const url = new URL(imagePath);

      // Existing Django media paths refer to files
      // that are currently available in React public/images.
      if (
        url.hostname === "roseva-fashion.onrender.com" &&
        url.pathname.startsWith("/images/")
      ) {
        return `/images/${url.pathname.slice(7)}`;
      }

      return imagePath;
    } catch {
      return "";
    }
  }

  // Existing static files
  if (imagePath.startsWith("/images/")) {
    return imagePath;
  }

  // Django media file paths
  const path = imagePath
    .replace(/^\/+/, "")
    .replace(/^media\//, "")
    .replace(/^images\//, "");

  if (
    /^(products|categories|banners|offers)\//.test(path)
  ) {
    return `/images/${path}`;
  }

  return `${BACKEND_URL}/${imagePath.replace(/^\/+/, "")}`;
}
