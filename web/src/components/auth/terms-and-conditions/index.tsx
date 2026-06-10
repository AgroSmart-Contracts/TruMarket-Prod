import React from "react";

interface TermsAndConditionsProps {}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = () => {
  return (
    <div className="max-h-[600px] overflow-y-auto p-[30px]">
      <div>
        <h1 className="mb-4 text-2xl font-bold">Terms and Conditions</h1>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">1. Introduction</h2>
          <p className="text-gray-700">
            Welcome to Agro Smart Contracts Lda, referred to as &quot;TruMarket&quot;. By accessing or using our
            platform, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not
            use our services.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">2. Services Provided</h2>
          <ul className="text-gray-700 list-inside list-disc">
            <li>
              <strong>Tokenization of Purchase Orders:</strong> Enables digital representation of purchase orders for
              financing in the fruit export industry.
            </li>
            <li>
              <strong>Smart Contract Creation:</strong> Users must accurately input purchase order information into
              smart contracts provided by TruMarket.
            </li>
            <li>
              <strong>Traceability and Documentation:</strong> Necessary documentation must be uploaded to ensure
              transparency and accountability in transactions.
            </li>
            <li>
              <strong>Market Intelligence:</strong> Provides data analysis for market insights, without guaranteeing
              information reliability.
            </li>
            <li>
              <strong>User Rating System:</strong> Tracks user compliance and service quality.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">3. Registration, Account Management, and KYC</h2>
          <ul className="text-gray-700 list-inside list-disc">
            <li>
              Registration requires verification via Google Auth, social media, or email, followed by a third-party KYC
              process.
            </li>
            <li>
              Accounts must contain truthful, updated information. Misleading information may lead to suspension or
              termination.
            </li>
            <li>
              Third-Party Services: TruMarket may allow access to or advertise third-party merchant sites
              (&quot;Merchants&quot;) from which users may purchase certain goods or services. Users understand that
              TruMarket does not operate or control the products or services offered by Merchants. Merchants are
              responsible for all aspects of order processing, fulfillment, billing, and customer service. TruMarket is
              not a party to the transactions entered into between users and Merchants.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">4. Prohibited Conduct</h2>
          <ul className="text-gray-700 list-inside list-disc">
            <li>No illegal activities such as fraud, money laundering, or trade sanction violations are permitted.</li>
            <li>
              The platform should not be used for unauthorized financial activities or to compromise its security.
            </li>
            <li>
              Users must ensure that all transactions comply with international trade laws and regulations. TruMarket is
              not responsible for monitoring legal compliance, and users indemnify the platform against any legal
              claims.
            </li>
            <li>
              Users must not engage in any behavior that manipulates or exploits the market functionality of the
              platform, including but not limited to, artificial inflation of prices, market manipulation schemes, or
              deceptive trading practices.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">5. Intellectual Property Rights</h2>
          <p className="text-gray-700">
            All platform content and data, including software and user interfaces, are owned by TruMarket.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">6. Limitation of Liability and Non-Custodial Disclaimer</h2>
          <ul className="text-gray-700 list-inside list-disc">
            <li>
              TruMarket is not a custodian of any funds transferred between users or third parties. All financial
              transactions are conducted directly between users or through third-party service providers.
            </li>
            <li>
              TruMarket shall not be liable for the failure of any user, whether supplier or buyer, to fulfill their
              contractual obligations to other parties. The platform facilitates the creation and management of
              contracts but is not a party to these contracts.
            </li>
            <li>
              The platform disclaims all liability related to user-generated content, the accuracy of data entered by
              users, and is not responsible for any direct or indirect damages arising from contractual failures.
            </li>
            <li>
              TruMarket does not guarantee continuous or secure access to the platform. The platform may be subject to
              limitations, delays, and other problems inherent in the use of the internet and electronic communications.
              TruMarket is not responsible for any delays, delivery failures, or other damage resulting from such
              problems.
            </li>
            <li>
              Users agree to indemnify and hold harmless TruMarket, its officers, directors, employees, and agents from
              any claims, damages, losses, liabilities, and expenses arising out of or related to your use of the
              platform, violation of these Terms, or violation of the rights of any other person or entity.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">7. Payment and Fees</h2>
          <p className="text-gray-700">
            TruMarket charges an 8% fee on each transaction value. All fees are disclosed upfront and are
            non-refundable.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">8. Termination and Suspension</h2>
          <p className="text-gray-700">
            Accounts may be terminated for violations of these terms, fraudulent activities, or harm to the platform.
            User data will be managed post-termination in compliance with legal obligations and privacy policies.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">9. Dispute Resolution</h2>
          <p className="text-gray-700">
            Disputes are subject to binding arbitration in Portugal, excluding class actions or arbitrations.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">10. Modifications to Terms</h2>
          <p className="text-gray-700">
            TruMarket may modify these terms at any time, with changes effective upon posting. Continued platform use
            after changes constitutes agreement to the modified terms.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">11. Jurisdiction</h2>
          <p className="text-gray-700">
            Governed by Portuguese law, with exclusive jurisdiction of Portuguese courts for disputes.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">12. General Provisions</h2>
          <p className="text-gray-700">
            If parts of these terms are invalid, they will be adjusted to reflect original intentions, while other parts
            remain effective. TruMarket may delegate services to third parties, ensuring they comply with these terms.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditions;
