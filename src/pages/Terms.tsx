import React from "react";
import { LegalLayout } from "../components/layout/LegalLayout";

const Terms: React.FC = () => {
  return (
    <LegalLayout 
      title="Terms of Service" 
      subtitle="The rules and regulations for using AURION."
      lastUpdated="December 14, 2025"
    >
      <section className="mb-8">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using AURION, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
        </p>
      </section>

      <section className="mb-8">
        <h2>2. Use of Service</h2>
        <p>
          AURION provides AI-powered tools for content creation. You agree to use the service only for lawful purposes and in accordance with these Terms.
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li>You must be at least 13 years old to use the service.</li>
          <li>You are responsible for maintaining the confidentiality of your account.</li>
          <li>You agree not to use the service to generate harmful or illegal content.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>3. Content Ownership</h2>
        <p>
          You retain ownership of the content you generate using AURION, subject to the terms of the underlying AI models. We claim no ownership over your creations.
        </p>
      </section>

      <section className="mb-8">
        <h2>4. Subscription and Billing</h2>
        <p>
          Some features of AURION require a paid subscription. You agree to provide accurate billing information and authorize us to charge your payment method.
        </p>
      </section>

      <section className="mb-8">
        <h2>5. Termination</h2>
        <p>
          We reserve the right to terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users.
        </p>
      </section>

      <section className="mb-8">
        <h2>6. Limitation of Liability</h2>
        <p>
          AURION shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
        </p>
      </section>
    </LegalLayout>
  );
};

export default Terms;
