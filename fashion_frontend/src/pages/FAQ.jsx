
import { useEffect, useState } from "react";
import { getFAQs } from "../services/contentApi";

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getFAQs()
      .then((data) => {
        setFaqs(Array.isArray(data) ? data : []);
      })
      .catch(() =>
        setError("Unable to load FAQs.")
      );
  }, []);

  return (
    <main className="section-container info-page">
      <div className="page-heading">
        <span className="eyebrow">
          NEED HELP?
        </span>
        <h1>Frequently Asked Questions</h1>
        <p>
          Find answers to common shopping questions.
        </p>
      </div>

      {error && <p>{error}</p>}

      <div className="faq-list">
        {faqs.map((faq) => (
          <details
            key={faq.id}
            className="faq-item"
          >
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}

        {!error && faqs.length === 0 && (
          <p>No FAQs available yet.</p>
        )}
      </div>
    </main>
  );
}
