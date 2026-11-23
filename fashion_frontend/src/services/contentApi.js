
const API_BASE = (
  import.meta.env.VITE_API_URL ||
  "https://roseva-fashion.onrender.com/api/"
).replace(/\/+$/, "");

async function request(path, options = {}) {
  const response = await fetch(
    `${API_BASE}/${path}`,
    options
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || "Something went wrong."
    );
  }

  return data;
}

export const getAbout = () =>
  request("about/");

export const getFAQs = () =>
  request("faqs/");

export const getContactSettings = () =>
  request("contact-settings/");

export const getWhyChooseUs = () =>
  request("why-choose-us/");

export const submitContact = (formData) =>
  request("contact-submit/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
