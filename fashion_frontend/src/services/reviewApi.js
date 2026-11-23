
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api/"
).replace(/\/+$/, "");

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.detail ||
      "Something went wrong."
    );
  }

  return data;
}

export async function getProductReviews(productId) {
  const response = await fetch(
    `${API_URL}/products/${productId}/reviews/`
  );

  return parseResponse(response);
}

export async function submitProductReview(
  productId,
  review,
  accessToken
) {
  const response = await fetch(
    `${API_URL}/products/${productId}/reviews/submit/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(review),
    }
  );

  return parseResponse(response);
}
