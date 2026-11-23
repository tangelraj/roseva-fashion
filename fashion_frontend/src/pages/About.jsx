
import { useEffect, useState } from "react";
import { getAbout } from "../services/contentApi";
import { getImageUrl } from "../utils/imageUrl";

export default function About() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAbout()
      .then(setData)
      .catch(() =>
        setError("Unable to load About Us.")
      );
  }, []);

  if (error) {
    return (
      <main className="section-container info-page">
        <p>{error}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="section-container info-page">
        <p>Loading About Us...</p>
      </main>
    );
  }

  return (
    <main className="section-container info-page">
      <div className="page-heading">
        <span className="eyebrow">OUR STORY</span>
        <h1>{data.title || "About Us"}</h1>
        <p>{data.subtitle}</p>
      </div>

      <div className="info-content">
        {data.image && (
          <img
            src={getImageUrl(data.image)}
            alt="Roséva Fashion"
            className="info-image"
          />
        )}

        <p>{data.description}</p>

        {data.mission && (
          <section>
            <h2>Our Mission</h2>
            <p>{data.mission}</p>
          </section>
        )}

        {data.vision && (
          <section>
            <h2>Our Vision</h2>
            <p>{data.vision}</p>
          </section>
        )}
      </div>
    </main>
  );
}
