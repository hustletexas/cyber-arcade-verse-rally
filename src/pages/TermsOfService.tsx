import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  const lastUpdated = "February 9, 2026";

  return (
    <div className="min-h-screen bg-arcade-dark p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/">
          <Button variant="ghost" className="mb-6 text-neon-cyan hover:text-neon-pink">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Arcade
          </Button>
        </Link>

        <Card className="arcade-frame">
          <CardHeader className="border-b border-neon-cyan/20">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-neon-cyan" />
              <div>
                <CardTitle className="text-2xl md:text-3xl text-neon-cyan">Terms of Service</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Last Updated: {lastUpdated}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none p-6 space-y-6">

            <section>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Cyber City Arcade. By accessing or using our website, applications, or services (collectively, the "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neon-pink mb-3">1. Overview of Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cyber City Arcade is a gaming and entertainment platform that offers interactive experiences, digital content, and optional digital collectibles, including non-fungible tokens ("NFTs").
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                NFTs offered on the Platform are intended as digital collectibles or access-based items and are not investment products.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neon-pink mb-3">2. Eligibility</h2>
              <p className="text-muted-foreground leading-relaxed">
                You must be at least 18 years old (or the age of majority in your jurisdiction) to make purchases on the Platform. By using the Platform, you represent that you meet this requirement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neon-pink mb-3">3. NFT & Digital Product Disclosures</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                <li>NFTs sold by Cyber City Arcade are not investments</li>
                <li>NFTs do not provide ownership in the company</li>
                <li>NFTs do not guarantee value, resale opportunities, profits, dividends, or future financial returns</li>
                <li>Any utility associated with NFTs (such as access or rewards) may change or end at any time</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                You acknowledge that blockchain technology involves inherent risks, including network failures, software bugs, or third-party wallet issues.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neon-pink mb-3">4. Purchases & Payments</h2>
              <p className="text-muted-foreground leading-relaxed">
                All purchases are processed through third-party payment providers (such as Stripe). Cyber City Arcade does not store your payment card information.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Prices are displayed in fiat currency during checkout. You are responsible for any applicable taxes associated with your purchase.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neon-pink mb-3">5. Delivery of Digital Products</h2>
              <p className="text-muted-foreground leading-relaxed">
                NFTs or digital access are delivered electronically after successful payment. Delivery times may vary due to technical or blockchain-related factors.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Cyber City Arcade is not responsible for delivery issues caused by incorrect wallet addresses or third-party wallet providers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neon-pink mb-3">6. Refunds & Cancellations</h2>
              <p className="text-muted-foreground leading-relaxed">
                All purchases are subject to our <Link to="/refund-policy" className="text-neon-cyan hover:text-neon-purple transition-colors underline">Refund Policy</Link>, which is incorporated into these Terms by reference.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Except where required by law, digital products and NFTs are generally non-refundable once delivered.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neon-pink mb-3">7. User Conduct</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                <li>Use the Platform for unlawful purposes</li>
                <li>Attempt to exploit, manipulate, or abuse pricing, rewards, or systems</li>
                <li>Circumvent geographic or access restrictions</li>
                <li>Engage in fraudulent or deceptive activity</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Cyber City Arcade reserves the right to suspend or terminate access for violations of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neon-pink mb-3">8. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content on the Platform, including logos, branding, artwork, and software, is owned by Cyber City Arcade or its licensors.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Purchasing an NFT does not grant ownership of intellectual property unless explicitly stated.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neon-pink mb-3">9. No Guarantees or Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Platform and all digital products are provided "as is" and "as available." Cyber City Arcade makes no guarantees regarding uninterrupted access, future features, or outcomes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neon-pink mb-3">10. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, Cyber City Arcade shall not be liable for indirect, incidental, or consequential damages, including loss of digital assets, lost profits, or data loss.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neon-pink mb-3">11. Changes to the Platform or Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may modify these Terms or the Platform at any time. Updates will be posted on this page. Continued use of the Platform constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neon-pink mb-3">12. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms are governed by the laws of the United States, without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neon-pink mb-3">13. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                For questions or concerns regarding these Terms, contact:
              </p>
              <p className="text-neon-cyan font-mono">
                <a href="mailto:support@cybercityarcade.com" className="hover:text-neon-purple transition-colors underline">
                  support@cybercityarcade.com
                </a>
              </p>
            </section>

            <div className="pt-6 border-t border-neon-cyan/20 flex flex-wrap gap-4">
              <Link to="/privacy">
                <Button variant="outline" className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10">
                  Privacy Policy
                </Button>
              </Link>
              <Link to="/refund-policy">
                <Button variant="outline" className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10">
                  Refund Policy
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
