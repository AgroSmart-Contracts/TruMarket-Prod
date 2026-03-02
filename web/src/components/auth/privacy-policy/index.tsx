import React from "react";

interface PrivacyPolicyProps {}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = () => {
  return (
    <div className="max-h-[600px] overflow-y-auto p-[30px]">
      <div>
        <h1 className="mb-4 text-2xl font-bold">Privacy Policy</h1>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">1. Introduction</h2>
          <p className="text-gray-700">
            Welcome to Agro Smart Contracts Lda, duly registered in Portugal with TaxID PT517935392. We are committed to
            protecting the privacy and security of your personal information. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">2. Information Collection and Use</h2>
          <p className="text-gray-700">
            We collect both company and personal information through forms and submissions on our website. The types of
            personal data we collect include:
          </p>
          <ul className="text-gray-700 list-inside list-disc">
            <li>Company name, tax identification number, and country</li>
            <li>Personal details such as names, addresses, emails, and payment information</li>
          </ul>
          <p className="text-gray-700">
            These details are necessary for service provision, specifically for Know Your Customer (KYC) compliance and
            creating user profiles. We process this data based on contractual necessity and with your consent.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">3. Data Sharing and Transfers</h2>
          <p className="text-gray-700">
            Your data is shared with third-party service providers to facilitate user onboarding through KYC processes.
            We ensure that these third parties adhere to GDPR standards and protect your data accordingly. We do not
            transfer personal data outside the European Economic Area.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">4. Data Security</h2>
          <p className="text-gray-700">
            To ensure the security of your data, we implement robust security measures including:
          </p>
          <ul className="text-gray-700 list-inside list-disc">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Restricted access to personal data to authorized personnel only</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">5. Data Retention</h2>
          <p className="text-gray-700">
            We retain your personal data only as long as necessary for the purposes it was collected, or to comply with
            our legal obligations. Typically, personal data is retained for the duration of your use of our service plus
            a period of up to 6 years to comply with tax and contract laws.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">6. Your Rights Under GDPR</h2>
          <p className="text-gray-700">As a data subject, you have the right to:</p>
          <ul className="text-gray-700 list-inside list-disc">
            <li>Access your personal data</li>
            <li>Request correction of any incorrect or incomplete data</li>
            <li>Object to processing of your data</li>
            <li>Request deletion of your data under certain circumstances</li>
            <li>
              Withdraw consent at any time, without affecting the lawfulness of processing based on consent before its
              withdrawal
            </li>
          </ul>
          <p className="text-gray-700">
            To exercise these rights, please contact our Data Protection Officer at{" "}
            <a href="mailto:admin@trumarket.tech" className="text-blue-500 underline">
              admin@trumarket.tech
            </a>
            .
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">7. Cookies and Similar Technologies</h2>
          <p className="text-gray-700">
            Our website uses cookies and similar tracking technologies to enhance your experience. We obtain your
            consent for these cookies when you first visit our website, and you can adjust your preferences at any time
            through our cookie settings.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">8. Contact Information</h2>
          <p className="text-gray-700">
            If you have any questions about this Privacy Policy or our data practices, please contact us at:
          </p>
          <address className="text-gray-700">
            Address: Av. Engenheiro Duarte Pacheco 19, R/C S4, Lisboa 1070-100, Portugal
            <br />
            Email:{" "}
            <a href="mailto:admin@trumarket.tech" className="text-blue-500 underline">
              admin@trumarket.tech
            </a>
          </address>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">9. Changes to This Policy</h2>
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on our website. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
