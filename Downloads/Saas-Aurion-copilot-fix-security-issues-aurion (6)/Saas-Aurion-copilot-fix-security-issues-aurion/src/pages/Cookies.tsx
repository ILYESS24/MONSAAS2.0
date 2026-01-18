import React from "react";
import { LegalLayout } from "../components/layout/LegalLayout";

const Cookies: React.FC = () => {
  return (
    <LegalLayout 
      title="Cookie Policy" 
      subtitle="Understanding how we use cookies."
      lastUpdated="December 14, 2025"
    >
      <section className="mb-8">
        <h2>1. What Are Cookies?</h2>
        <p>
          Cookies are small text files that are stored on your computer or mobile device when you visit a website. They allow the website to remember your actions and preferences over a period of time.
        </p>
      </section>

      <section className="mb-8">
        <h2>2. How We Use Cookies</h2>
        <p>We use cookies for the following purposes:</p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>Essential Cookies:</strong> Necessary for the website to function (e.g., authentication).</li>
          <li><strong>Analytics Cookies:</strong> To understand how visitors interact with our website.</li>
          <li><strong>Preference Cookies:</strong> To remember your settings and choices.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>3. Managing Cookies</h2>
        <p>
          You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed.
        </p>
      </section>
    </LegalLayout>
  );
};

export default Cookies;
