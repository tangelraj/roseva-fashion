
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Instagram,
  Facebook,
  Mail,
  MapPin,
  Phone,
  Heart,
} from "lucide-react";
import { getHomepage } from "../services/api";

const defaultWebsite = {
  site_name: "ROSÉVA",
  brand_tagline: "FASHION",
  logo: null,
  email: "support@example.com",
  phone: "",
  address: "India",
  instagram_url: "https://instagram.com",
  facebook_url: "https://facebook.com",
  footer_description:
    "Discover timeless elegance, beautiful ethnic wear, and modern styles for girls and women.",
  footer_bottom_text:
    "Made with love for beautiful fashion.",
};

const fallbackGroups = [
  {
    id: 1,
    title: "Quick Links",
    links: [
      { id: 1, title: "Home", url: "/" },
      { id: 2, title: "Shop All", url: "/shop" },
      { id: 3, title: "Wishlist", url: "/wishlist" },
      { id: 4, title: "Shopping Cart", url: "/cart" },
    ],
  },
  {
    id: 2,
    title: "Collections",
    links: [
      { id: 5, title: "Sarees", url: "/shop?category=sarees" },
      { id: 6, title: "Salwar Suits", url: "/shop?category=salwar" },
      { id: 7, title: "Frocks", url: "/shop?category=frocks" },
      { id: 8, title: "Kurtis", url: "/shop?category=kurtis" },
      { id: 9, title: "Lehengas", url: "/shop?category=lehengas" },
    ],
  },
  {
    id: 3,
    title: "Customer Care",
    links: [
      { id: 10, title: "Track Order", url: "/track-order" },
      {
        id: 11,
        title: "Contact Support",
        url: "mailto:support@example.com",
      },
    ],
  },
];

function FooterLink({ item }) {
  const url = item.url || "/";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("mailto:") ||
    url.startsWith("tel:")
  ) {
    return (
      <a
        href={url}
        target={url.startsWith("http") ? "_blank" : undefined}
        rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {url.startsWith("mailto:") && <Mail size={16} />}
        {item.title}
      </a>
    );
  }

  return <Link to={url}>{item.title}</Link>;
}

export default function Footer() {
  const [website, setWebsite] = useState(defaultWebsite);
  const [groups, setGroups] = useState(fallbackGroups);

  useEffect(() => {
    let cancelled = false;

    async function loadFooter() {
      try {
        const data = await getHomepage();

        if (cancelled) return;

        if (data.website) {
          setWebsite({
            ...defaultWebsite,
            ...data.website,
          });
        }

        if (Array.isArray(data.footer_groups)) {
          setGroups(
            data.footer_groups
              .filter((group) => group.is_active !== false)
              .sort(
                (a, b) =>
                  (a.display_order ?? 0) -
                  (b.display_order ?? 0)
              )
          );
        }
      } catch (error) {
        console.error("Footer API error:", error);
      }
    }

    loadFooter();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="brand-logo">
            {website.logo ? (
              <img
                src={website.logo}
                alt={website.site_name || "Roséva Fashion"}
                style={{
                  maxWidth: 170,
                  maxHeight: 48,
                  objectFit: "contain",
                }}
              />
            ) : (
              <>
                {website.site_name || "ROSÉVA"}
                <small>{website.brand_tagline || "FASHION"}</small>
              </>
            )}
          </Link>

          <p>{website.footer_description}</p>

          <div className="footer-socials">
            {website.instagram_url && (
              <a
                href={website.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            )}

            {website.facebook_url && (
              <a
                href={website.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
            )}
          </div>
        </div>

        {groups.map((group) => (
          <div className="footer-column" key={group.id}>
            <h3>{group.title}</h3>

            {(group.links || [])
              .filter((item) => item.is_active !== false)
              .sort(
                (a, b) =>
                  (a.display_order ?? 0) -
                  (b.display_order ?? 0)
              )
              .map((item) => (
                <FooterLink key={item.id} item={item} />
              ))}

            {group.title.toLowerCase().includes("customer") && (
              <>
                {website.phone && (
                  <p>
                    <Phone size={16} /> {website.phone}
                  </p>
                )}

                {website.address && (
                  <p>
                    <MapPin size={16} /> {website.address}
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()}{" "}
          {website.site_name || "Roséva Fashion"}. All rights reserved.
        </p>

        <p>
          <Heart size={14} />{" "}
          {website.footer_bottom_text}
        </p>
      </div>
    </footer>
  );
}
