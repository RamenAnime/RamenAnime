import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, ArrowLeft, FileText, Lock, Eye, Globe, Server, Trash2, Mail, Bell } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen py-12">
      <div className="container px-4 md:px-6 max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>

        <div className="text-center mb-10 space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: April 30, 2026 · Version 1.0.0
          </p>
          <p className="text-xs text-muted-foreground">
            Compliant with: USA (CCPA, COPPA) · Japan (APPI) · Canada (PIPEDA) · South Korea (PIPA) · France/EU (GDPR)
          </p>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Ramen Anime ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal data when you visit our website, use our social forum, marketplace, or any related services (collectively, the "Services").
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This policy complies with applicable privacy laws across all jurisdictions where we operate, including the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA) in the United States, the Act on the Protection of Personal Information (APPI) in Japan, the Personal Information Protection and Electronic Documents Act (PIPEDA) in Canada, the Personal Information Protection Act (PIPA) in South Korea, and the General Data Protection Regulation (GDPR) in the European Union and France.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We collect the following categories of personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                <li><strong>Account Information:</strong> Name, email address, avatar image, and user ID provided through OAuth authentication.</li>
                <li><strong>Profile Information:</strong> Display name, bio, interests, location, and other optional fields you choose to provide on your profile.</li>
                <li><strong>Content:</strong> Forum posts, comments, marketplace listings, and any other content you submit to the Services.</li>
                <li><strong>Usage Data:</strong> IP address, browser type, device information, pages visited, and interaction timestamps.</li>
                <li><strong>Cookies & Similar Technologies:</strong> We use cookies for authentication, language preferences, and age verification status.</li>
                <li><strong>Transaction Data:</strong> For marketplace listings, we store listing details but do NOT process payments directly. Payment transactions occur on third-party platforms (eBay).</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">3. Legal Basis for Processing (GDPR)</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Under the GDPR, we process your personal data based on the following legal grounds:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                <li><strong>Consent:</strong> When you create an account, accept our Terms, or opt-in to communications.</li>
                <li><strong>Contract:</strong> To provide the Services you request, including forum access and marketplace listings.</li>
                <li><strong>Legal Obligation:</strong> To comply with applicable laws, respond to legal requests, and enforce our Terms.</li>
                <li><strong>Legitimate Interests:</strong> For security, fraud prevention, service improvement, and analytics.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">4. How We Use Your Information</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                <li>To provide, maintain, and improve our Services.</li>
                <li>To authenticate users and secure user accounts.</li>
                <li>To display user-generated content (forum posts, profiles, marketplace listings).</li>
                <li>To communicate with you about your account, listings, or policy changes.</li>
                <li>To enforce our Terms of Service and prevent abuse.</li>
                <li>To comply with legal obligations across jurisdictions.</li>
                <li>To analyze usage patterns and improve user experience.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">5. Data Sharing & Disclosure</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell your personal information. We may share data in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                <li><strong>Service Providers:</strong> We use trusted third-party providers for hosting, database services, and analytics. All providers are contractually bound to protect your data.</li>
                <li><strong>Legal Requirements:</strong> We may disclose data when required by law, court order, or government request in any applicable jurisdiction.</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or asset sale, user data may be transferred subject to the same privacy protections.</li>
                <li><strong>With Your Consent:</strong> We may share data when you explicitly authorize it.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">6. International Data Transfers</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Our servers may be located in different jurisdictions. By using our Services, you consent to the transfer of your data to countries that may have different data protection laws than your own. We ensure appropriate safeguards are in place, including standard contractual clauses approved by the European Commission for GDPR compliance.
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm">
                For users in Japan, we comply with the APPI's requirements for cross-border transfers. For users in South Korea, we comply with PIPA's notification and consent requirements for overseas transfers.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">7. Data Security</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your data, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                <li>SSL/TLS encryption for all data transmissions.</li>
                <li>Secure JWT-based authentication with httpOnly cookies.</li>
                <li>Regular security audits and vulnerability assessments.</li>
                <li>Role-based access controls for administrative functions.</li>
                <li>Data minimization practices to limit collection to necessary information.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed text-sm">
                While we strive to protect your data, no security system is impenetrable. We cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Trash2 className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">8. Data Retention & Deletion</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal data for as long as necessary to provide our Services and comply with legal obligations. You may request deletion of your account and associated data at any time by contacting us.
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Upon deletion, we will remove your personal data within 30 days, except where retention is required by law (e.g., for tax, legal, or regulatory compliance purposes). Forum posts and comments may be anonymized rather than deleted to preserve community discussions.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">9. Your Rights</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Depending on your jurisdiction, you have the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
                <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request deletion of your personal data (GDPR, APPI).</li>
                <li><strong>Right to Restriction:</strong> Request limitation of processing under certain conditions.</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format (GDPR).</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests or direct marketing.</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time without affecting the lawfulness of prior processing.</li>
                <li><strong>Right to Non-Discrimination:</strong> Exercise your privacy rights without fear of discriminatory treatment (CCPA/CPRA).</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed text-sm">
                To exercise any of these rights, please contact us at ramenanime@protonmail.com. We will respond within 30 days, or sooner as required by your local laws.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">10. Children's Privacy (COPPA / GDPR / PIPA)</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Our Services are not intended for children under 13 years of age. We do not knowingly collect personal data from children under 13. If you are a parent or guardian and believe your child has provided us with personal data without your consent, please contact us immediately and we will delete such information.
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm">
                For users aged 13-17, parental or guardian consent is required to use the social forum features. Our age verification gate requires users to confirm they are 18 or older, or have obtained appropriate consent.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">11. Cookies & Tracking</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar technologies for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                <li><strong>Essential Cookies:</strong> Required for authentication, age verification, and security. These cannot be disabled.</li>
                <li><strong>Preference Cookies:</strong> Remember your language settings and display preferences.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our Services. You can opt out of analytics tracking.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed text-sm">
                You can manage cookie preferences through your browser settings. Note that disabling essential cookies may prevent you from using certain features.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">12. Contact Us</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <a href="mailto:ramenanime@protonmail.com" className="text-primary hover:underline block">
                ramenanime@protonmail.com
              </a>
              <p className="text-muted-foreground leading-relaxed text-sm mt-2">
                We will make reasonable efforts to address your concerns. If you are located in the EU, you also have the right to lodge a complaint with your local data protection authority.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">13. Changes to This Policy</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of material changes via email or through the Services. The "Last updated" date at the top of this page indicates when the policy was last revised.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
