
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

async function fetchData(endpoint) {
  const response = await fetch(
    `${API_URL}/${endpoint}/`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `API error ${response.status}: ${endpoint}`
    );
  }

  return response.json();
}

export const getHomepage = () =>
  fetchData("homepage");

export const getCategories = () =>
  fetchData("categories");

export const getProducts = () =>
  fetchData("products");
