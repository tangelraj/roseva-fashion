
const BACKEND_URL =
  "https://roseva-fashion.onrender.com";

export function getImageUrl(image) {
  if (!image) return "";

  const value =
    typeof image === "string"
      ? image
      : image.url || image.image || "";

  if (typeof value !== "string" || !value) {
    return "";
  }

  // Absolute URLs: Cloudinary, Render, etc.
  if (/^https?:\/\//i.test(value)) {
    // Handle legacy Render media URLs
    // only if a matching local static file exists.
    const url = new URL(value);

    if (
      url.hostname === "roseva-fashion.onrender.com" &&
      url.pathname.startsWith("/media/")
    ) {
      return `/images/${url.pathname.slice(7)}`;
    }

    return value;
  }

  if (value.startsWith("data:")) {
    return value;
  }

  const path = value
    .replace(/^\/+/, "")
    .replace(/^media\//, "")
    .replace(/^images\//, "");

  if (
    /^(products|categories|banners|offers)\//.test(path)
  ) {
    return `/images/${path}`;
  }

  return `${BACKEND_URL}/${value.replace(/^\/+/, "")}`;
}
