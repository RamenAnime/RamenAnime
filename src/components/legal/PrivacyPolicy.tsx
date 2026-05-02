import { useComplianceFramework } from "./ComplianceRouter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function PrivacyPolicy() {
  const { framework } = useComplianceFramework();
  const f = framework;
  const lastUpdated = "May 2, 2025";

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="prose dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: {lastUpdated} | Framework: {f?.privacyLaw ?? "Global Best Practices"} | Region: {f?.name ?? "Global"}</p>

        <div className="bg-muted/50 p-4 rounded-lg mb-8 text-sm">
          <p className="font-medium mb-2">Quick Summary</p>
          <p>We collect minimal data necessary to operate our Services. We do not sell your personal data. We use industry-standard encryption. You have rights to access, correct, and delete your data. We retain data for {f?.dataRetentionDays ?? 1825} days maximum.</p>
        </div>

        <Accordion type="multiple" defaultValue={["item-1"]} className="space-y-2">

          <AccordionItem value="item-1" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">1. Introduction and Scope</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p>This Privacy Policy describes how Ramen Anime ("we," "us," or "our") collects, uses, stores, shares, and protects your personal information when you use our website, mobile applications, marketplace, social forum, and related services (collectively, the "Services").</p>
              <p>This Policy complies with {f?.privacyLaw ?? "international privacy standards"} and applies to all users worldwide. Depending on your location, you may have additional rights as described in Section 10.</p>
              <p>By using our Services, you consent to the practices described in this Policy. If you do not agree, please do not use the Services.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">2. Information We Collect</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p><strong>2.1 Information You Provide Directly:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Account Information:</strong> Username, email address, password (stored as bcrypt hash with cost factor 12)</li>
                <li><strong>Profile Information:</strong> Display name, bio, avatar, location, interests (all optional)</li>
                <li><strong>Marketplace Information:</strong> Shipping addresses, payment method tokens (processed by Stripe/PayPal - we never store full card numbers)</li>
                <li><strong>Forum Content:</strong> Posts, comments, messages you create</li>
                <li><strong>Communications:</strong> Customer support inquiries, feedback</li>
                <li><strong>Age Verification:</strong> Age confirmation, optional ID verification for age-gated content</li>
              </ul>

              <p><strong>2.2 Information Collected Automatically:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent, click patterns</li>
                <li><strong>Geolocation:</strong> Country derived from IP address for compliance (VAT calculation, age verification, export controls)</li>
                <li><strong>Cookies and Similar Technologies:</strong> See Section 8 (Cookie Policy)</li>
              </ul>

              <p><strong>2.3 Information from Third Parties:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Payment processors (Stripe, PayPal) - transaction confirmation, last 4 digits of card</li>
                <li>Authentication services (if using OAuth)</li>
                <li>Fraud prevention services</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">3. How We Use Your Information</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p>We use your personal data for the following purposes:</p>
              <table className="w-full text-xs border-collapse my-4">
                <thead><tr className="border-b"><th className="text-left py-2">Purpose</th><th className="text-left py-2">Legal Basis (GDPR)</th><th className="text-left py-2">Data Used</th></tr></thead>
                <tbody className="space-y-2">
                  <tr className="border-b border-border/50"><td className="py-2">Account creation and management</td><td>Contract performance</td><td>Username, email, password hash</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2">Service provision</td><td>Contract performance</td><td>Profile data, forum posts, preferences</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2">Payment processing</td><td>Contract performance</td><td>Payment tokens, transaction history</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2">Tax compliance</td><td>Legal obligation</td><td>Transaction data, country, VAT records</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2">Security and fraud prevention</td><td>Legitimate interest</td><td>IP address, device info, usage patterns</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2">Age verification</td><td>Legal obligation</td><td>Age declaration, optional ID docs</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2">Legal compliance (export controls, sanctions)</td><td>Legal obligation</td><td>Country, transaction details</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2">Service improvement</td><td>Legitimate interest</td><td>Aggregated usage analytics</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2">Customer support</td><td>Contract performance</td><td>Account data, communication history</td></tr>
                  <tr><td className="py-2">Marketing (with consent only)</td><td>Consent</td><td>Email, preferences</td></tr>
                </tbody>
              </table>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">4. How We Share Your Information</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p>We do not sell your personal data. We share data only in the following circumstances:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Service Providers:</strong> Payment processors (Stripe, PayPal), hosting providers (Render), email services, analytics providers. All are bound by data processing agreements.</li>
                <li><strong>Other Users:</strong> Your profile information and forum posts are visible to other users as intended by the service design.</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental authority. We will notify you unless prohibited.</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or asset sale, with notice to users.</li>
                <li><strong>With Your Consent:</strong> For any purpose you specifically authorize.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">5. Data Retention and Deletion</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p>We retain personal data for as long as necessary to fulfill the purposes described in this Policy:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Account data:</strong> Until account deletion, or {f?.dataRetentionDays ?? 1825} days of inactivity</li>
                <li><strong>Transaction records:</strong> {f?.dataRetentionDays ?? 2555} days (tax/legal requirements)</li>
                <li><strong>Forum posts:</strong> Until deletion by user or account closure</li>
                <li><strong>Log files:</strong> 90 days</li>
                <li><strong>Cookie consent records:</strong> 2 years</li>
              </ul>
              <p>Upon account deletion request, we delete or anonymize your personal data within 30 days, except where retention is required by law (transaction records for tax purposes).</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">6. Data Security</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p>We implement industry-standard security measures:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Encryption:</strong> TLS 1.3 for all data in transit; AES-256 for data at rest</li>
                <li><strong>Passwords:</strong> bcrypt hashing with cost factor 12 (64-byte/512-bit output)</li>
                <li><strong>Authentication:</strong> JWT tokens with httpOnly cookies; session expiry after 1 year</li>
                <li><strong>Access Controls:</strong> Role-based access (user/admin); principle of least privilege</li>
                <li><strong>Monitoring:</strong> Automated logging of access attempts; anomaly detection</li>
                <li><strong>Breach Response:</strong> In case of a data breach, we will notify affected users within {f?.breachNotificationHours ?? 72} hours as required by {f?.privacyLaw ?? "applicable law"}.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">7. International Data Transfers</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p>Your data is stored on servers in the United States. For users in the EU/EEA, UK, and other jurisdictions requiring data transfer protections:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>We use Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li>For UK transfers, we comply with the UK Addendum to SCCs</li>
                <li>We monitor adequacy decisions and legal developments affecting transfers</li>
                <li>All transfers are protected by encryption in transit (TLS 1.3)</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">8. Cookie Policy</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p>We use cookies and similar technologies as follows:</p>
              <table className="w-full text-xs border-collapse my-4">
                <thead><tr className="border-b"><th className="text-left py-2">Category</th><th className="text-left py-2">Purpose</th><th className="text-left py-2">Duration</th><th className="text-left py-2">Required?</th></tr></thead>
                <tbody>
                  <tr className="border-b border-border/50"><td className="py-2">Essential</td><td>Authentication, security, session management</td><td>Session - 1 year</td><td>Yes (cannot disable)</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2">Preferences</td><td>Language selection, theme, display settings</td><td>1 year</td><td>No</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2">Analytics</td><td>Service improvement, usage statistics</td><td>1 year</td><td>No</td></tr>
                  <tr><td className="py-2">Marketing</td><td>Personalized recommendations (if consented)</td><td>1 year</td><td>No</td></tr>
                </tbody>
              </table>
              <p>{f?.requiresCookieConsent ? "Under " + f.privacyLaw + ", we require your consent before placing non-essential cookies. You can manage preferences through our cookie consent banner." : "You can manage cookie preferences through your browser settings."}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-9" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">9. Children's Privacy</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p>We comply with COPPA (US), GDPR requirements for children (EU), and equivalent laws globally. Our Services are not directed at children under 13.</p>
              <p>We do not knowingly collect personal information from children under {f?.ageOfConsent ?? 16} without {f?.requiresParentalConsent ? "verifiable parental consent" : "appropriate safeguards"}. If you are a parent and believe your child has provided personal information without consent, contact us immediately and we will delete the information.</p>
              <p>Age-gated sections of our Services (social forum, marketplace) require users to confirm they are at least 18 years old.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-10" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">10. Your Privacy Rights</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p>Depending on your location, you may have the following rights:</p>
              <table className="w-full text-xs border-collapse my-4">
                <thead><tr className="border-b"><th className="text-left py-2">Right</th><th className="text-left py-2">Description</th><th className="text-left py-2">Available In</th></tr></thead>
                <tbody>
                  <tr className="border-b border-border/50"><td className="py-2">Access</td><td>Request a copy of your personal data</td><td>All jurisdictions</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2">Correction</td><td>Request correction of inaccurate data</td><td>All jurisdictions</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2">Deletion (Right to be Forgotten)</td><td>Request deletion of your data</td><td>{f?.rightToBeForgotten ? "Yes - " + f.privacyLaw : "Limited"}</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2">Portability</td><td>Receive data in a structured, machine-readable format</td><td>{f?.dataPortability ? "Yes - " + f.privacyLaw : "Limited"}</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2">Objection</td><td>Object to processing based on legitimate interests</td><td>EU, UK, Brazil, South Korea</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2">Restriction</td><td>Request restriction of processing</td><td>EU, UK, Brazil</td></tr>
                  <tr className="border-b border-border/50"><td className="py-2">Withdraw Consent</td><td>Withdraw consent at any time</td><td>All jurisdictions (where consent is basis)</td></tr>
                  <tr><td className="py-2">Lodge Complaint</td><td>Complain to supervisory authority</td><td>EU, UK, Brazil, South Korea</td></tr>
                </tbody>
              </table>
              <p>To exercise any right, email us at privacy@ramenanime.app. We respond within 30 days.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-11" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">11. Automated Decision-Making and Profiling</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p>We do not engage in profiling or automated decision-making that produces legal effects concerning you, except for:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Fraud detection and prevention algorithms</li>
                <li>Spam/content filter automation for forum posts</li>
                <li>Geolocation-based access control and tax calculation</li>
              </ul>
              <p>These systems do not result in automated decisions that significantly affect your legal rights. Human review is available for disputed decisions.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-12" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">12. Changes to This Policy</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p>We may update this Privacy Policy periodically. Material changes will be notified via email or prominent notice at least 30 days before taking effect. Continued use after changes constitutes acceptance. The "Last Updated" date at the top indicates the most recent revision.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-13" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">13. Contact Us</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p><strong>Data Protection Officer:</strong> dpo@ramenanime.app</p>
              <p><strong>Privacy Inquiries:</strong> privacy@ramenanime.app</p>
              <p><strong>Postal Address:</strong><br />
              Ramen Anime Privacy Office<br />
              123 Anime Street<br />
              Los Angeles, CA 90001<br />
              United States</p>
              <p><strong>EU Supervisory Authorities:</strong> You have the right to lodge a complaint with your local data protection authority. A list is available at: https://edpb.europa.eu/about-edpb/board/members</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
