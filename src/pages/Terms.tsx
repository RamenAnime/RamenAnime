import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, ArrowLeft, FileText, Users, Lock, AlertTriangle, Globe, Scale, Ban, Mail } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen py-12">
      <div className="container px-4 md:px-6 max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>

        <div className="text-center mb-10 space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: April 30, 2026 · Version 1.0.0
          </p>
          <p className="text-xs text-muted-foreground">
            Jurisdictions: USA · Japan · Canada · South Korea · France/EU
          </p>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using the Ramen Anime website, social forum, marketplace, and any related services (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Services. These Terms apply to all visitors, users, and others who access or use the Services, regardless of their jurisdiction.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You must be at least 18 years of age to use the Services, or at least 13 years of age with verifiable parental or guardian consent. By using the Services, you represent and warrant that you meet these age requirements and that you have the legal capacity to enter into a binding contract in your jurisdiction.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Scale className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">2. Governing Law & Jurisdiction</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws applicable in your primary jurisdiction of residence. For users in the United States, disputes shall be resolved under the laws of the State of California. For users in Japan, disputes shall be resolved under Japanese law. For users in Canada, disputes shall be resolved under the laws of the Province of Ontario. For users in South Korea, disputes shall be resolved under the laws of the Republic of Korea. For users in France and the European Union, disputes shall be resolved under French and EU law.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Any dispute, controversy, or claim arising out of or relating to these Terms shall first be attempted to be resolved through good-faith negotiation. If negotiation fails, disputes shall be submitted to binding arbitration in accordance with the arbitration rules of the jurisdiction where the user resides, except where prohibited by applicable consumer protection laws.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">3. User Accounts & Conduct</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                When you create an account, you must provide accurate, current, and complete information. You are solely responsible for safeguarding your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You agree not to use the Services to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                <li>Harass, abuse, stalk, threaten, or harm another person, including through hate speech, discrimination, or intimidation.</li>
                <li>Post content that is sexually explicit, violent, obscene, defamatory, libelous, or otherwise objectionable under applicable laws in any jurisdiction.</li>
                <li>Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with any person or entity.</li>
                <li>Engage in spamming, unsolicited advertising, pyramid schemes, or other fraudulent activities.</li>
                <li>Distribute malware, viruses, worms, trojan horses, or any other harmful code.</li>
                <li>Interfere with or disrupt the Services or servers, or violate any applicable local, state, national, or international law or regulation.</li>
                <li>Sell counterfeit, pirated, or unauthorized reproductions of copyrighted works, including anime merchandise, trading cards, or related intellectual property.</li>
                <li>Use the Services for any commercial purpose not expressly authorized by us, except for legitimate marketplace listings.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">4. Content & Intellectual Property</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                You retain ownership of any content you post to the Services ("User Content"). By posting User Content, you grant Ramen Anime a non-exclusive, royalty-free, worldwide, sublicensable license to use, display, reproduce, modify, adapt, publish, and distribute your content solely for the purpose of operating, promoting, and improving the Services. This license survives termination of your account solely for the purpose of preserving community discussions.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                All anime character designs, trading card artwork, and related intellectual property displayed on the Services belong to their respective copyright holders. Ramen Anime does not claim ownership of third-party intellectual property. Our 3D printed designs and fan-made creations are intended for personal, non-commercial use and fall under applicable fair use, fair dealing, or quotation provisions in the relevant jurisdictions (e.g., 17 U.S.C. § 107 in the United States; Article 32 of the Japanese Copyright Act; Article L.122-5 of the French Intellectual Property Code).
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If you believe any content on the Services infringes your copyright or other intellectual property rights, please contact us at ramenanime@protonmail.com with a detailed notice including: (a) identification of the copyrighted work claimed to be infringed, (b) identification of the allegedly infringing material, (c) your contact information, (d) a statement of good faith belief, (e) a statement of accuracy under penalty of perjury, and (f) your electronic or physical signature.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">5. Marketplace Terms</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                The Ramen Anime User Marketplace is a platform where registered users may list new or used anime goods, trading cards, 3D printed items, and related merchandise for sale or trade. By using the marketplace, you agree to the following:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                <li><strong>No Direct Payment Processing:</strong> Ramen Anime does not process payments between buyers and sellers. All transactions must be arranged independently between the parties (e.g., through eBay, PayPal, bank transfer, or other mutually agreed methods).</li>
                <li><strong>Accurate Listings:</strong> You must provide accurate descriptions, prices, conditions, and images for all listings. Misrepresentation of items is strictly prohibited.</li>
                <li><strong>Prohibited Items:</strong> You may not list: (a) counterfeit or pirated goods, (b) items that violate intellectual property rights, (c) illegal items under any applicable law, (d) weapons, drugs, or hazardous materials, (e) items that promote hate speech or discrimination.</li>
                <li><strong>Buyer/Seller Responsibility:</strong> Ramen Anime is not a party to any transaction between marketplace users. We do not guarantee the quality, safety, or legality of items listed, nor the accuracy of listings. Buyers and sellers assume all risks associated with marketplace transactions.</li>
                <li><strong>Dispute Resolution:</strong> Any disputes between marketplace users must be resolved directly between the parties. Ramen Anime may, at its sole discretion, assist in dispute resolution but is under no obligation to do so.</li>
                <li><strong>Tax Compliance:</strong> Sellers are solely responsible for complying with all applicable tax laws, including sales tax, VAT, GST, and income tax reporting requirements in their jurisdiction.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">6. Privacy & Data Protection</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We collect and process personal data in accordance with our Privacy Policy. By using the Services, you consent to such processing. We implement reasonable technical and organizational security measures to protect your data but cannot guarantee absolute security.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We comply with applicable data protection laws across all jurisdictions where we operate, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                <li><strong>United States:</strong> California Consumer Privacy Act (CCPA/CPRA), Children's Online Privacy Protection Act (COPPA), and applicable state privacy laws.</li>
                <li><strong>Japan:</strong> Act on the Protection of Personal Information (APPI) and related guidelines.</li>
                <li><strong>Canada:</strong> Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable provincial privacy laws.</li>
                <li><strong>South Korea:</strong> Personal Information Protection Act (PIPA) and related enforcement decrees.</li>
                <li><strong>France/European Union:</strong> General Data Protection Regulation (GDPR), ePrivacy Directive, and French Data Protection Act (Loi Informatique et Libertés).</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Users in the European Economic Area and Japan have additional rights regarding their personal data, including the right to access, rectify, erase, restrict processing, data portability, and object to processing. To exercise these rights, contact us at ramenanime@protonmail.com.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Ban className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">7. Termination & Moderation</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to suspend or terminate your account at any time, with or without notice, for conduct that we believe violates these Terms, is harmful to other users, us, or third parties, or for any other reason at our sole discretion. Reasons for termination include but are not limited to: repeated violations of community guidelines, posting prohibited content, engaging in fraudulent marketplace activity, harassment of other users, or attempts to circumvent security measures.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to remove any content posted to the Services that violates these Terms or that we find objectionable for any reason. We are not obligated to monitor the Services but may do so at our discretion using automated tools and human moderators.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Upon termination, your right to use the Services will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">8. Disclaimers & Limitation of Liability</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. RAMEN ANIME DOES NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, SECURE, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW IN YOUR JURISDICTION, RAMEN ANIME SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO YOUR USE OF OR INABILITY TO USE THE SERVICES.
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Nothing in these Terms shall exclude or limit liability for: (a) death or personal injury caused by negligence; (b) fraud or fraudulent misrepresentation; (c) any liability that cannot be excluded or limited under applicable law (including consumer protection laws in the EU, Japan, and South Korea).
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">9. Indemnification</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                You agree to defend, indemnify, and hold harmless Ramen Anime, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or in any way connected with: (a) your access to or use of the Services; (b) your User Content; (c) your violation of these Terms; (d) your violation of any third-party right, including intellectual property, privacy, or publicity rights; (e) your marketplace transactions with other users.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">10. Changes to Terms</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We may modify these Terms at any time. We will notify users of material changes via email or through the Services at least 30 days before the changes take effect, except where immediate changes are required by law or for security reasons. Your continued use of the Services after changes constitutes acceptance of the revised Terms.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If you do not agree to the modified Terms, you must stop using the Services immediately. You must accept the current version of the Terms before accessing the social forum, marketplace, or any community features.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">11. Contact</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions, concerns, or legal notices regarding these Terms, please contact us at:
              </p>
              <a href="mailto:ramenanime@protonmail.com" className="text-primary hover:underline block">
                ramenanime@protonmail.com
              </a>
              <p className="text-muted-foreground leading-relaxed text-sm mt-2">
                We will make reasonable efforts to respond to inquiries within the timeframes required by applicable law in your jurisdiction (e.g., 30 days under GDPR, without undue delay under PIPEDA).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
