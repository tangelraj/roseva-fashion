
import { useEffect, useState } from "react";

import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Clock,
  MessageCircle,
} from "lucide-react";

import {
  getContactSettings,
  submitContact,
} from "../services/contentApi";

const defaultSettings = {
  title: "Contact Us",
  description:
    "Have a question about our collections or orders? We'd love to hear from you.",
  email: "",
  phone: "",
  address: "",
  instagram_url: "",
  facebook_url: "",
  support_hours: "",
};

export default function Contact() {
  const [settings, setSettings] =
    useState(defaultSettings);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadContact() {
      try {
        const data = await getContactSettings();

        if (cancelled) return;

        const contactData =
          data?.contact_settings || data;

        setSettings({
          ...defaultSettings,
          ...(contactData &&
          typeof contactData === "object" &&
          !Array.isArray(contactData)
            ? contactData
            : {}),
        });

        setLoadError("");
      } catch (error) {
        console.error(
          "Contact settings API error:",
          error
        );

        if (!cancelled) {
          setLoadError(
            "Contact details are temporarily unavailable."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadContact();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (sending) return;

    setSending(true);
    setStatus("");

    try {
      await submitContact(form);

      setStatus(
        "Your message has been submitted successfully!"
      );

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setStatus(
        error.message ||
          "Unable to send your message. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="section-container info-page">
      {/* PAGE HEADING */}
      <div className="page-heading">
        <span className="eyebrow">
          GET IN TOUCH
        </span>

        <h1>
          {settings.title || "Contact Us"}
        </h1>

        <p>
          {settings.description ||
            defaultSettings.description}
        </p>
      </div>

      <div className="contact-layout">
        {/* LEFT SIDE - CONTACT INFORMATION */}
        <div className="contact-details">
          <h2>Get in Touch</h2>

          <p className="contact-intro">
            Have questions about our beautiful
            collections, orders or delivery?
            Our team would love to hear from you.
          </p>

          {loadError && (
            <p role="alert" className="contact-notice">
              {loadError}
            </p>
          )}

          {loading && (
            <p>Loading contact information...</p>
          )}

          <div className="contact-info-list">
            {/* EMAIL */}
            <div className="contact-info-item">
              <div className="contact-icon">
                <Mail size={22} />
              </div>

              <div>
                <h3>Email Us</h3>

                {settings.email ? (
                  <a
                    href={`mailto:${settings.email}`}
                  >
                    {settings.email}
                  </a>
                ) : (
                  <p>
                    admin@gmail.com
                  </p>
                )}
              </div>
            </div>

            {/* PHONE */}
            <div className="contact-info-item">
              <div className="contact-icon">
                <Phone size={22} />
              </div>

              <div>
                <h3>Call Us</h3>

                {settings.phone ? (
                  <a
                    href={`tel:${settings.phone}`}
                  >
                    {settings.phone}
                  </a>
                ) : (
                  <p>
                    9876543210
                  </p>
                )}
              </div>
            </div>

            {/* LOCATION */}
            <div className="contact-info-item">
              <div className="contact-icon">
                <MapPin size={22} />
              </div>

              <div>
                <h3>Our Location</h3>

                <p>
                  {settings.address ||
                    "India"}
                </p>
              </div>
            </div>

            {/* SUPPORT HOURS */}
            <div className="contact-info-item">
              <div className="contact-icon">
                <Clock size={22} />
              </div>

              
            </div>
          </div>

          {/* SOCIAL LINKS */}
          
            <div className="contact-social-section">
            <h3>Follow Us</h3>

            <div className="contact-social-links">
                <a
                href={settings.instagram_url || "https://www.instagram.com/"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                title="Instagram"
                className="contact-social-icon"
                >
                <Instagram size={22} />
                </a>

                <a
                href={settings.facebook_url || "https://www.facebook.com/"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                title="Facebook"
                className="contact-social-icon"
                >
                <Facebook size={22} />
                </a>
            </div>
            </div>
          <div className="contact-help-note">
            <MessageCircle size={20} />

            <p>
              You can also send us a message using
              the contact form.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE - CONTACT FORM */}
        <form
          className="contact-form"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={form.subject}
            onChange={handleChange}
          />

          <textarea
            name="message"
            placeholder="Your Message"
            rows={6}
            value={form.message}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="primary-button"
            disabled={sending}
          >
            {sending
              ? "Sending..."
              : "Send Message"}
          </button>

          {status && (
            <p role="status" className="contact-form-status">
              {status}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
