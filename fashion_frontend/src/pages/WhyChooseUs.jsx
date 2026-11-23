
import { useEffect, useState } from "react";
import {
  Heart,
  ShieldCheck,
  Truck,
  Sparkles,
  Star,
  Headphones,
} from "lucide-react";

import { getWhyChooseUs } from "../services/contentApi";

const ICONS = {
  heart: Heart,
  shield: ShieldCheck,
  truck: Truck,
  sparkles: Sparkles,
  star: Star,
  support: Headphones,
};

export default function WhyChooseUs() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getWhyChooseUs()
      .then((data) =>
        setItems(Array.isArray(data) ? data : [])
      )
      .catch(console.error);
  }, []);

  return (
    <main className="section-container info-page">
      <div className="page-heading">
        <span className="eyebrow">
          THE ROSÉVA PROMISE
        </span>

        <h1>Why Choose Us</h1>

        <p>
          Fashion, quality and care in every detail.
        </p>
      </div>

      <div className="benefits-grid">
        {items.map((item) => {
          const Icon = ICONS[item.icon] || Heart;

          return (
            <article
              key={item.id}
              className="benefit-card"
            >
              <Icon size={32} />

              <h3>{item.title}</h3>

              <p>{item.description}</p>
            </article>
          );
        })}
      </div>
    </main>
  );
}
