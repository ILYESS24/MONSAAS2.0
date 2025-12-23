import React from "react";
import { LegalLayout } from "../components/layout/LegalLayout";

const Privacy: React.FC = () => {
  return (
    <LegalLayout 
      title="Privacy Policy" 
      subtitle="How we collect, use, and protect your data."
      lastUpdated="December 14, 2025"
    >
      <section className="mb-8">
        <h2>1. Introduction</h2>
        <p>
          At AURION, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our multimodal creation platform.
        </p>
      </section>

      <section className="mb-8">
        <h2>2. Information We Collect</h2>
        <p>We collect information that you provide directly to us when you register, create content, or communicate with us.</p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>Personal Data:</strong> Name, email address, password.</li>
          <li><strong>Usage Data:</strong> Interactions with our AI tools, generated content metadata.</li>
          <li><strong>Technical Data:</strong> IP address, browser type, device information.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>3. How We Use Your Information</h2>
        <p>We use the collected information to:</p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li>Provide, maintain, and improve our AI services.</li>
          <li>Process your transactions and manage your account.</li>
          <li>Send you technical notices, updates, and support messages.</li>
          <li>Monitor and analyze trends, usage, and activities.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>4. Data Sharing</h2>
        <p>
          We do not sell your personal data. We may share information with third-party vendors (e.g., cloud providers, AI model providers) solely for the purpose of providing our services.
        </p>
      </section>

      <section className="mb-8">
        <h2>5. Your Rights</h2>
        <p>
          Depending on your location, you may have rights regarding your personal data, including the right to access, correct, or delete your information.
        </p>
      </section>

      <section className="mb-8">
        <h2>6. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@aurion.ai" className="text-blue-600 hover:underline">privacy@aurion.ai</a>.
        </p>
      </section>
    </LegalLayout>
  );
};

export default Privacy;
