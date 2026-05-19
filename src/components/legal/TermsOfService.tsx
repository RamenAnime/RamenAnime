import { useComplianceFramework } from "./ComplianceRouter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  const { t } = useTranslation();
  const { framework, country: _country } = useComplianceFramework();
  const f = framework;
  const lastUpdated = "May 2, 2025";

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">{t("legal.backHome")}</Link>
        </Button>
      </div>
      <div className="prose dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-2">{t("legal.termsTitle")}</h1>
        <p className="text-sm text-muted-foreground mb-8">
          {t("legal.lastUpdated", { date: lastUpdated })} | {t("legal.applicableLaw", { law: f?.privacyLaw ?? "Global Standards" })} | {t("legal.yourRegion", { region: f?.name ?? "Global" })}
        </p>

        <Accordion type="multiple" defaultValue={["item-1"]} className="space-y-2">

          <AccordionItem value="item-1" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">1. Acceptance of Terms</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p>By accessing or using ラーメンアニメ ("Ramen Anime," "we," "us," or "our"), including our website, mobile applications, marketplace, social forum, and any related services (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not access or use the Services.</p>
              <p>These Terms constitute a legally binding agreement between you and Ramen Anime. We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the Services after changes constitutes acceptance of the revised Terms. We will notify you of material changes via email or prominent notice on the Services at least 30 days before they take effect, as required by applicable consumer protection laws.</p>
              <p>If you are accessing the Services from the European Union, these Terms are supplemented by our EU-specific provisions. If you are a California resident, your rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA) are preserved and not limited by these Terms.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">2. Eligibility and Account Registration</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p><strong>2.1 Age Requirements.</strong> You must be at least 18 years of age to create an account and use the full Services, including the Ramen Anime marketplace and social forum. If you are under 18, you may only use the Services with the involvement and consent of a parent or legal guardian, and only the general shop features that do not involve user-to-user interaction. By creating an account, you represent and warrant that you meet these age requirements.</p>
              <p><strong>2.2 Parental Consent.</strong> Under {f?.privacyLaw ?? "applicable privacy law"}, if you are under the age of {f?.ageOfConsent ?? 16}, verifiable parental consent is required before we collect, use, or disclose your personal information. We use email verification with follow-up confirmation as our parental consent mechanism, consistent with COPPA (if in the US) and equivalent frameworks.</p>
              <p><strong>2.3 Account Security.</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use. We implement industry-standard security measures including bcrypt password hashing with cost factor 12, HTTPS/TLS 1.3 encryption for all data in transit, and JWT-based session management with httpOnly cookies.</p>
              <p><strong>2.4 Account Termination.</strong> We reserve the right to suspend or terminate your account at our sole discretion for violations of these Terms, illegal activity, or for the protection of our community. In the EU, you have the right to terminate your account at any time and request data deletion under GDPR Article 17.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">3. Privacy and Data Protection</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p>Your privacy is governed by our Privacy Policy, which is incorporated into these Terms by reference. Our data practices comply with {f?.privacyLaw ?? "international privacy standards"}.</p>
              <p><strong>3.1 Data Collection.</strong> We collect: (a) account information (username, email, password hash); (b) profile information you voluntarily provide; (c) transaction data for marketplace purchases; (d) forum posts and comments; (e) IP address and device information for security and geolocation compliance; (f) cookies and similar technologies as detailed in our Cookie Policy.</p>
              <p><strong>3.2 Legal Basis for Processing (GDPR/LGPD).</strong> For users in jurisdictions requiring a legal basis, we process personal data on the following grounds: (a) performance of contract (providing Services); (b) legitimate interests (security, fraud prevention); (c) legal obligation (tax reporting, law enforcement requests); (d) consent (marketing communications, optional features).</p>
              <p><strong>3.3 Your Rights.</strong> Depending on your jurisdiction, you may have the right to: access your data, correct inaccuracies, delete your account and data (right to be forgotten), object to processing, data portability, withdraw consent, and lodge complaints with supervisory authorities. To exercise these rights, contact us at the address in Section 16.</p>
              <p><strong>3.4 Data Retention.</strong> We retain your personal data for {f?.dataRetentionDays ?? 1825} days, or as long as necessary to fulfill the purposes for which it was collected, comply with legal obligations, resolve disputes, and enforce our agreements. After this period, data is securely deleted or anonymized.</p>
              <p><strong>3.5 International Transfers.</strong> Your data may be transferred to and processed in countries other than your country of residence, including the United States, where our servers are located. For transfers from the EU/EEA, UK, or other jurisdictions requiring adequacy protections, we implement Standard Contractual Clauses (SCCs) approved by the European Commission.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">4. Marketplace Terms</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p><strong>4.1 Nature of Marketplace.</strong> The Ramen Anime Marketplace is a platform that connects buyers and sellers of anime merchandise. We are not a party to transactions between users. We do not take title to items sold, and we do not guarantee the quality, safety, or legality of items listed.</p>
              <p><strong>4.2 Seller Obligations.</strong> Sellers must: (a) accurately describe items; (b) comply with all applicable laws regarding the sale of goods; (c) not sell prohibited items including counterfeit goods, weapons, regulated substances, or items that infringe intellectual property rights; (d) ship items within the timeframe specified; (e) collect and remit all applicable taxes as required by their jurisdiction.</p>
              <p><strong>4.3 Buyer Obligations.</strong> Buyers must: (a) pay for items promptly; (b) not engage in fraudulent chargebacks; (c) report issues within 30 days of delivery. Buyers are responsible for understanding import restrictions and customs duties in their country.</p>
              <p><strong>4.4 Prohibited Items.</strong> The following may not be sold: counterfeit merchandise, weapons or replica weapons, adult content materials, items promoting hate speech or violence, stolen goods, items subject to export controls (military/dual-use), and any item prohibited by the buyer's or seller's local laws.</p>
              <p><strong>4.5 Dispute Resolution.</strong> For disputes between buyers and sellers, both parties must first attempt resolution through our internal dispute process. If unresolved within 14 days, disputes may be escalated to mediation. Users in the EU may also use the European Online Dispute Resolution (ODR) platform.</p>
              <p><strong>4.6 Tax Compliance.</strong> Prices displayed on Ramen Anime may or may not include VAT/tax depending on your location. We automatically calculate and display applicable taxes based on the buyer's country using our Tax Engine. Sellers are responsible for remitting collected taxes to their local tax authorities. We provide transaction records to assist with tax reporting.</p>
              <p><strong>4.7 Platform Fees.</strong> We charge a platform fee on completed transactions. Current fees: 8% of item price for standard sellers, 5% for verified sellers. Fees are subject to change with 30 days notice.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">5. VAT, GST, and Tax Compliance</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p><strong>5.1 Tax Collection.</strong> Ramen Anime operates as a marketplace facilitator in jurisdictions requiring marketplace tax collection. We automatically calculate, collect, and remit applicable taxes including VAT (EU/UK), GST (Australia, Canada, Singapore), consumption tax (Japan), and state sales tax (US) where required by law.</p>
              <p><strong>5.2 EU VAT.</strong> For buyers in EU member states, VAT is charged at the rate applicable in the buyer's country of residence. This follows the EU VAT e-commerce rules (Council Directive 2017/2455 and 2019/1995). Sellers do not need to register for VAT separately for marketplace sales in the EU.</p>
              <p><strong>5.3 UK VAT.</strong> For buyers in the United Kingdom, UK VAT at 20% is applied to digital services and applicable goods. This follows the UK VAT e-commerce regulations post-Brexit.</p>
              <p><strong>5.4 US Sales Tax.</strong> We collect sales tax in US states where we have economic nexus or where marketplace facilitator laws apply. Buyers in states without sales tax will not be charged.</p>
              <p><strong>5.5 Digital Services Tax.</strong> In jurisdictions with Digital Services Tax (DST), applicable taxes are included in the platform fee calculation and remitted as required.</p>
              <p><strong>5.6 Tax Records.</strong> We provide transaction-level tax reports to sellers. Buyers receive tax invoices where required. We retain tax records for {f?.dataRetentionDays ?? 7} years as required by applicable tax laws.</p>
              <p><strong>5.7 Export Tariffs.</strong> For international shipments, buyers are responsible for any import duties, customs fees, or tariffs imposed by their country. These are not included in the purchase price unless explicitly stated.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">6. Social Forum and User Content</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p><strong>6.1 Content Ownership.</strong> You retain ownership of content you post to the forum, your profile, and comments. By posting, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and display such content for the purpose of operating and promoting the Services.</p>
              <p><strong>6.2 Content Standards.</strong> You may not post content that: (a) is unlawful, harmful, threatening, abusive, harassing, defamatory, or invasive of privacy; (b) infringes intellectual property rights; (c) contains malware or harmful code; (d) promotes illegal activities; (e) contains explicit sexual content (our platform is for general audiences with anime-related content); (f) constitutes spam or unauthorized advertising.</p>
              <p><strong>6.3 Content Moderation.</strong> We reserve the right to remove content that violates these Terms. We employ both automated systems and human moderators. Our moderation decisions are final. Under the EU Digital Services Act (DSA), you have the right to appeal moderation decisions.</p>
              <p><strong>6.4 Age-Gated Content.</strong> Certain forum sections require age verification. You must not attempt to circumvent age verification systems. Providing false age information is grounds for immediate account termination.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">7. Intellectual Property</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p><strong>7.1 Our IP.</strong> The Services, including all software, designs, logos, trademarks, and content provided by us, are owned by Ramen Anime or our licensors and are protected by copyright, trademark, and other intellectual property laws. You may not use our trademarks without prior written consent.</p>
              <p><strong>7.2 DMCA / Notice and Takedown.</strong> We comply with the Digital Millennium Copyright Act (DMCA) and equivalent notice-and-takedown procedures in other jurisdictions. If you believe content infringes your copyright, submit a takedown notice to the contact in Section 16 with: (a) your contact information; (b) identification of the copyrighted work; (c) identification of the infringing material; (d) a statement of good faith belief; (e) a statement under penalty of perjury; (f) your electronic signature.</p>
              <p><strong>7.3 Counter-Notification.</strong> If your content was removed due to a DMCA notice, you may submit a counter-notification. We will forward it to the original complainant and restore content after 10 business days unless legal action is filed.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">8. Payment Processing</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p>Payments are processed through third-party payment processors (Stripe, PayPal). By making a purchase, you agree to their terms. We do not store full payment card numbers. PCI DSS compliance is maintained by our payment processors.</p>
              <p>Refunds are processed according to our Refund Policy: (a) digital goods: no refund after download; (b) physical goods: 14-day return period under EU Consumer Rights Directive; (c) marketplace items: subject to seller's return policy with platform mediation available.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-9" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">9. Prohibited Conduct</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p>You may not: (a) use the Services for any illegal purpose; (b) attempt to gain unauthorized access to any part of the Services; (c) interfere with or disrupt the Services; (d) use automated systems (bots, scrapers) without authorization; (e) harvest user data; (f) impersonate any person or entity; (g) circumvent geolocation or age verification; (h) engage in money laundering or terrorist financing; (i) violate export control laws; (j) resell or commercially exploit the Services without authorization.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-10" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">10. Limitation of Liability</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p><strong>10.1 Disclaimer.</strong> THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
              <p><strong>10.2 Liability Cap.</strong> To the maximum extent permitted by law, our total liability shall not exceed the amount you paid to us in the 12 months preceding the claim, or $100 USD, whichever is greater. This limitation does not apply to: (a) gross negligence or willful misconduct; (b) death or personal injury; (c) fraud; (d) where prohibited by consumer protection laws.</p>
              <p><strong>10.3 EU Consumer Exception.</strong> If you are a consumer in the EU, statutory consumer rights under EU law are not affected by these limitations, including rights under the Consumer Sales and Guarantees Directive.</p>
              <p><strong>10.4 Force Majeure.</strong> We are not liable for failures caused by circumstances beyond our reasonable control, including natural disasters, wars, terrorism, riots, embargoes, acts of civil or military authorities, fires, floods, accidents, strikes, or shortages of transportation, facilities, fuel, energy, labor, or materials.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-11" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">11. Dispute Resolution and Governing Law</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p><strong>11.1 Governing Law.</strong> These Terms are governed by the laws of the State of California, USA, without regard to conflict of law principles, except where overridden by mandatory consumer protection laws of your country of residence.</p>
              <p><strong>11.2 EU Users.</strong> If you are a consumer in the EU, you additionally benefit from mandatory consumer protection laws of your EU member state. Any disputes may be brought in the courts of your place of residence.</p>
              <p><strong>11.3 Arbitration (US Users).</strong> For users in the United States, any dispute shall first be attempted to be resolved through good-faith negotiation. If unresolved within 30 days, either party may initiate binding arbitration under the American Arbitration Association (AAA) Commercial Arbitration Rules. The arbitration shall be conducted in Los Angeles, California.</p>
              <p><strong>11.4 Class Action Waiver.</strong> TO THE EXTENT PERMITTED BY LAW, YOU AGREE THAT ANY PROCEEDINGS WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. This waiver does not apply to claims under consumer protection laws that prohibit class action waivers.</p>
              <p><strong>11.5 ODR Platform.</strong> EU consumers may use the European Commission's Online Dispute Resolution platform: https://ec.europa.eu/odr</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-12" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">12. Export Controls and Sanctions</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p>You may not use the Services to export, re-export, or transfer items in violation of applicable export control laws, including US Export Administration Regulations (EAR), EU Dual-Use Regulation 2021/821, or UN Security Council sanctions. Prohibited items include military goods, dual-use items, and items destined for sanctioned countries or entities.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-13" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">13. Children's Privacy (COPPA Compliance)</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p>We comply with the Children's Online Privacy Protection Act (COPPA) and equivalent laws worldwide. We do not knowingly collect personal information from children under 13 without verifiable parental consent. If we learn we have collected personal information from a child under 13 without parental consent, we will delete that information immediately.</p>
              <p>Parents or guardians who believe their child has provided us with personal information may contact us to request deletion.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-14" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">14. Termination</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p>You may terminate your account at any time through account settings or by contacting us. We may terminate or suspend your account immediately for violations of these Terms. Upon termination, your right to use the Services ceases immediately. Provisions that by their nature should survive termination shall survive.</p>
              <p>Under GDPR Article 17, you have the right to request erasure of your personal data. We will comply within 30 days unless legal obligations require retention.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-15" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">15. Geolocation and Service Availability</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p>We use geolocation technology to determine your country of access. The Services are only available in countries we have configured for access. This is necessary for legal compliance including export controls, age verification requirements, and tax obligations.</p>
              <p>We may restrict access from certain countries or regions based on legal requirements, sanctions, or other compliance considerations. Attempting to circumvent geolocation restrictions is a violation of these Terms.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-16" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">16. Contact Information</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed space-y-3">
              <p>For legal notices, privacy requests, DMCA takedowns, or general inquiries:</p>
              <p><strong>Ramen Anime Legal Department</strong><br />
              Email: legal@ramenanime.app<br />
              Address: Ramen Anime, 123 Anime Street, Los Angeles, CA 90001, USA</p>
              <p><strong>Data Protection Officer (EU/UK):</strong><br />
              Email: dpo@ramenanime.app</p>
              <p><strong>Supervisory Authority (EU):</strong><br />
              You have the right to lodge a complaint with your local data protection authority.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
