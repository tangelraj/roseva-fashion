
import {
  Truck,
  ShieldCheck,
  RefreshCcw,
  Sparkles,
  Gift,
  Heart,
  Tag,
  PackageCheck,
  CreditCard,
  Headphones,
  Star,
} from "lucide-react";

import "./AnnouncementBar.css";

// ========================================
// ICONS AVAILABLE IN DJANGO ADMIN
// ========================================

const iconMap = {
  truck: Truck,
  shield: ShieldCheck,
  refresh: RefreshCcw,
  sparkles: Sparkles,
  gift: Gift,
  heart: Heart,
  tag: Tag,
  package: PackageCheck,
  credit_card: CreditCard,
  support: Headphones,
  star: Star,
};

// ========================================
// DEFAULT BENEFITS
// Used only when no API data is supplied
// ========================================

const defaultBenefits = [
  {
    id: 1,
    icon: "truck",
    text: "Free Shipping Above ₹1999",
  },
  {
    id: 2,
    icon: "shield",
    text: "Secure Shopping",
  },
  {
    id: 3,
    icon: "refresh",
    text: "Easy Returns*",
  },
  {
    id: 4,
    icon: "sparkles",
    text: "Curated Fashion",
  },
];

// ========================================
// ANNOUNCEMENT BAR COMPONENT
// ========================================

export default function AnnouncementBar({
  benefits,
}) {
  // An explicitly supplied empty array means
  // all items were disabled/deleted in Admin.
  const items = Array.isArray(benefits)
    ? benefits
    : defaultBenefits;

  const activeBenefits = items
    .filter((item) => item.is_active !== false)
    .sort(
      (a, b) =>
        (a.display_order ?? 0) -
        (b.display_order ?? 0)
    );

  if (activeBenefits.length === 0) {
    return null;
  }

  return (
    <section
      className="roseva-marquee"
      aria-label="Shopping benefits"
    >
      <div className="roseva-marquee-track">
        {[0, 1].map((copy) => (
          <div
            className="roseva-marquee-group"
            key={copy}
            aria-hidden={copy === 1}
          >
            {activeBenefits.map((benefit, index) => {
              const Icon =
                iconMap[benefit.icon] || Sparkles;

              return (
                <div
                  className="roseva-marquee-item"
                  key={`${copy}-${benefit.id ?? index}`}
                >
                  <Icon
                    size={22}
                    aria-hidden="true"
                  />

                  <span>{benefit.text}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
