
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
import { getImageUrl } from "../utils/imageUrl";

// Default website information
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

// Default footer groups
const fallbackGroups = [
  {
    id: 1,
    title: "Quick Links",
    links: [
      {
        id: 1,
        title: "Home",
        url: "/",
      },
      {
        id: 2,
        title: "Shop All",
        url: "/shop",
      },
      {
        id: 3,
        title: "Wishlist",
        url: "/wishlist",
      },
      {
        id: 4,
        title: "Shopping Cart",
        url: "/cart",
      },
    ],
  },
  {
    id: 2,
    title: "Collections",
    links: [
      {
        id: 5,
        title: "Sarees",
        url: "/shop?category=sarees",
      },
      {
        id: 6,
        title: "Salwar Suits",
        url: "/shop?category=salwar",
      },
      {
        id: 7,
        title: "Frocks",
        url: "/shop?category=frocks",
      },
      {
        id: 8,
        title: "Kurtis",
        url: "/shop?category=kurtis",
      },
      {
        id: 9,
        title: "Lehengas",
        url: "/shop?category=lehengas",
      },
    ],
  },
  {
    id: 3,
    title: "Customer Care",
    links: [
      {
        id: 10,
        title: "Track Order",
        url: "/track-order",
      },
      {
        id: 11,
        title: "About Us",
        url: "/about",
      },
      {
        id: 12,
        title: "FAQ",
        url: "/faq",
      },
      {
        id: 13,
        title: "Contact Us",
        url: "/contact",
      },
      {
        id: 14,
        title: "Why Choose Us",
        url: "/why-choose-us",
      },
    ],
  },
];

// Links that should appear in Customer Care
const customerCareLinks = [
  {
    id: "about",
    title: "About Us",
    url: "/about",
  },
  {
    id: "faq",
    title: "FAQ",
    url: "/faq",
  },
  {
    id: "contact",
    title: "Contact Us",
    url: "/contact",
  },
  {
    id: "why",
    title: "Why Choose Us",
    url: "/why-choose-us",
  },
];

// Sort footer groups and links
function sortByOrder(items) {
  return [...items].sort(
    (a, b) =>
      Number(a.display_order ?? 0) -
      Number(b.display_order ?? 0)
  );
}

// Add missing Customer Care links without duplicates
function getCustomerCareLinks(links = []) {
  const existingLinks = Array.isArray(links)
    ? links.filter(
        (item) => item.is_active !== false
      )
    : [];

  const existingUrls = new Set(
    existingLinks.map((item) => {
      const url = String(item.url || "/");
      return url.replace(/\/+$/, "") || "/";
    })
  );

  const missingLinks = customerCareLinks.filter(
    (item) => !existingUrls.has(item.url)
  );

  return [
    ...sortByOrder(existingLinks),
    ...missingLinks,
  ];
}

// Render internal and external links
function FooterLink({ item }) {
  const url = item.url || "/";

  const isExternal =
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("mailto:") ||
    url.startsWith("tel:");

  if (isExternal) {
    const opensNewTab =
      url.startsWith("http://") ||
      url.startsWith("https://");

    return (
      <a
        href={url}
        target={opensNewTab ? "_blank" : undefined}
        rel={
          opensNewTab
            ? "noopener noreferrer"
            : undefined
        }
      >
        {url.startsWith("mailto:") && (
          <Mail size={16} />
        )}

        {item.title}
      </a>
    );
  }

  return (
    <Link to={url}>
      {item.title}
    </Link>
  );
}

export default function Footer() {
  const [website, setWebsite] = useState(
    defaultWebsite
  );

  const [groups, setGroups] = useState(
    fallbackGroups
  );

  // Load footer content from Django Admin
  useEffect(() => {
    let cancelled = false;

    async function loadFooter() {
      try {
        const data = await getHomepage();

        if (cancelled) return;

        // Website settings
        if (data?.website) {
          setWebsite({
            ...defaultWebsite,
            ...data.website,
          });
        }

        // Footer groups from Django
        if (
          Array.isArray(data?.footer_groups) &&
          data.footer_groups.length > 0
        ) {
          const activeGroups = sortByOrder(
            data.footer_groups.filter(
              (group) =>
                group.is_active !== false
            )
          );

          setGroups(activeGroups);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Footer API error:",
            error
          );
        }
      }
    }

    loadFooter();

    return () => {
      cancelled = true;
    };
  }, []);

  // Identify Customer Care group
  const hasCustomerCareGroup = groups.some(
    (group) =>
      String(group.title || "")
        .toLowerCase()
        .includes("customer")
  );

  // Add Customer Care group if Django doesn't provide one
  const displayGroups = hasCustomerCareGroup
    ? groups
    : [
        ...groups,
        {
          id: "customer-care",
          title: "Customer Care",
          links: customerCareLinks,
        },
      ];

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* BRAND INFORMATION */}
        <div className="footer-brand">
          <Link
            to="/"
            className="brand-logo"
          >
            {website.logo ? (
              <img
                src={getImageUrl(website.logo)}
                alt={
                  website.site_name ||
                  "Roséva Fashion"
                }
                style={{
                  maxWidth: 170,
                  maxHeight: 48,
                  objectFit: "contain",
                }}
              />
            ) : (
              <>
                {website.site_name || "ROSÉVA"}

                <small>
                  {website.brand_tagline ||
                    "FASHION"}
                </small>
              </>
            )}
          </Link>

          <p>
            {website.footer_description}
          </p>

          {/* SOCIAL MEDIA */}
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

        {/* FOOTER LINK GROUPS */}
        {displayGroups.map((group) => {
          const isCustomerCare = String(
            group.title || ""
          )
            .toLowerCase()
            .includes("customer");

          const links = isCustomerCare
            ? getCustomerCareLinks(
                group.links || []
              )
            : sortByOrder(
                (group.links || []).filter(
                  (item) =>
                    item.is_active !== false
                )
              );

          return (
            <div
              className="footer-column"
              key={group.id}
            >
              <h3>{group.title}</h3>

              {/* FOOTER LINKS */}
              {links.map((item) => (
                <FooterLink
                  key={item.id ?? item.url}
                  item={item}
                />
              ))}

              {/* CONTACT INFORMATION */}
              {isCustomerCare && (
                <>
                  {website.email && (
                    <p>
                      <Mail size={16} />

                      <a
                        href={`mailto:${website.email}`}
                      >
                        {website.email}
                      </a>
                    </p>
                  )}

                  {website.phone && (
                    <p>
                      <Phone size={16} />

                      <a
                        href={`tel:${website.phone}`}
                      >
                        {website.phone}
                      </a>
                    </p>
                  )}

                  {website.address && (
                    <p>
                      <MapPin size={16} />
                      {website.address}
                    </p>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* FOOTER BOTTOM */}
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()}{" "}
          {website.site_name ||
            "Roséva Fashion"}
          . All rights reserved.
        </p>

        <p>
          <Heart size={14} />{" "}
          {website.footer_bottom_text}
        </p>
      </div>
    </footer>
  );
}
