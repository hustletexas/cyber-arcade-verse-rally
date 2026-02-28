import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  const lastUpdated = "January 20, 2026";

  return (
    <div className="min-h-screen bg-arcade-dark p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" onClick={() => window.scrollTo(0, 0)}>
          <Button variant="ghost" className="mb-6 text-neon-cyan hover:text-neon-pink">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Arcade
          </Button>
        </Link>

        <Card className="arcade-frame">
          <CardHeader className="border-b border-neon-cyan/20">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-neon-cyan" />
              <div>
                <CardTitle className="text-2xl md:text-3xl text-neon-cyan">Privacy Policy</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Last Updated: {lastUpdated}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none p-6 space-y-6">
            
            <section>
              <h2 className="text-xl text-neon-pink mb-3">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cyber Arcade Verse ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our gaming and 
                cryptocurrency platform. Please read this policy carefully.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">2. Information We Collect</h2>
              
              <h3 className="text-lg text-neon-cyan mt-4 mb-2">2.1 Information You Provide</h3>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li>Email address (for account registration)</li>
                <li>Username and profile information</li>
                <li>Wallet addresses (public keys only)</li>
                <li>Transaction history on our Platform</li>
                <li>Communication preferences</li>
                <li>Support inquiries and feedback</li>
              </ul>

              <h3 className="text-lg text-neon-cyan mt-4 mb-2">2.2 Automatically Collected Information</h3>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li>Device information (browser type, operating system)</li>
                <li>IP address and approximate location</li>
                <li>Usage data (pages visited, features used, game scores)</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Session duration and interaction patterns</li>
              </ul>

              <h3 className="text-lg text-neon-cyan mt-4 mb-2">2.3 Blockchain Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                Blockchain transactions are publicly visible. We may collect and display your public wallet address and 
                transaction history as it appears on public blockchains. This data is inherently public and cannot be deleted.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">3. How We Use Your Information</h2>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li>Provide and maintain our Platform services</li>
                <li>Process transactions and distribute rewards</li>
                <li>Manage tournaments and leaderboards</li>
                <li>Communicate important updates and announcements</li>
                <li>Prevent fraud, cheating, and abuse</li>
                <li>Comply with legal obligations</li>
                <li>Improve our services through analytics</li>
                <li>Personalize your gaming experience</li>
                <li>Respond to your inquiries and support requests</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">4. Wallet & Cryptocurrency Data</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong className="text-neon-cyan">Private Keys:</strong> We do NOT store your wallet private keys on our 
                servers. If you use our browser-based wallet feature, encrypted keys are stored locally in your browser. 
                You are solely responsible for backing up and securing your private keys.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong className="text-neon-cyan">Public Addresses:</strong> Your public wallet addresses may be stored in 
                our database to associate your account with your assets and transaction history.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-neon-cyan">Transaction Data:</strong> We store records of Platform transactions for 
                accounting, dispute resolution, and regulatory compliance purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">5. Data Sharing & Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We do not sell your personal information. We may share data with:
              </p>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li><strong>Service Providers:</strong> Third parties who help operate our Platform (hosting, analytics, payment processing)</li>
                <li><strong>Legal Authorities:</strong> When required by law, court order, or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">6. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Platform integrates with third-party services including:
              </p>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside mt-2">
                <li>Blockchain networks (Stellar, Ethereum)</li>
                <li>Decentralized exchanges (Aqua Network, StellarX)</li>
                <li>Wallet providers (LOBSTR, Freighter, MetaMask)</li>
                <li>Analytics services</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                These services have their own privacy policies. We are not responsible for their data practices.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">7. Cookies & Tracking</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We use cookies and similar technologies to:
              </p>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li>Keep you logged in</li>
                <li>Remember your preferences</li>
                <li>Analyze Platform usage</li>
                <li>Prevent fraud</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                You can control cookies through your browser settings, but disabling them may affect Platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">8. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures including:
              </p>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside mt-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Row-level security for database access</li>
                <li>Regular security audits</li>
                <li>Access controls and authentication</li>
                <li>Rate limiting to prevent abuse</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                However, no system is 100% secure. You use our Platform at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">9. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your data for as long as your account is active or as needed to provide services. Transaction 
                records may be retained longer for legal and compliance purposes. Blockchain data is permanent and cannot 
                be deleted. Upon account deletion request, we will remove your personal data from our systems within 30 days, 
                except where retention is required by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">10. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Depending on your jurisdiction, you may have rights to:
              </p>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your data (subject to legal requirements)</li>
                <li>Object to processing</li>
                <li>Data portability</li>
                <li>Withdraw consent</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                To exercise these rights, contact us at privacy@cyberarcadeverse.com
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">11. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your data may be transferred to and processed in countries other than your own. We ensure appropriate 
                safeguards are in place for such transfers in compliance with applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">12. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Platform is not intended for users under 18 years of age. We do not knowingly collect personal 
                information from children. If we learn that we have collected data from a child, we will delete it 
                promptly. If you believe a child has provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">13. California Privacy Rights (CCPA)</h2>
              <p className="text-muted-foreground leading-relaxed">
                California residents have additional rights including: the right to know what personal information is 
                collected, the right to delete personal information, the right to opt-out of the sale of personal 
                information (we do not sell personal information), and the right to non-discrimination for exercising 
                privacy rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">14. GDPR Compliance (EU Users)</h2>
              <p className="text-muted-foreground leading-relaxed">
                For users in the European Economic Area, we process data based on: consent, contract performance, 
                legal obligations, and legitimate interests. You have rights under GDPR including access, rectification, 
                erasure, restriction, portability, and objection. Contact our Data Protection Officer for GDPR inquiries.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">15. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy periodically. We will notify you of material changes via email or 
                Platform notification. Your continued use after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">16. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                For privacy-related questions or to exercise your rights:<br />
                Email: privacy@cyberarcadeverse.com<br />
                Data Protection Officer: dpo@cyberarcadeverse.com
              </p>
            </section>

            <div className="pt-6 border-t border-neon-cyan/20">
              <p className="text-sm text-muted-foreground text-center">
                By using Cyber Arcade Verse, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link to="/terms" className="text-neon-cyan hover:text-neon-pink transition-colors">
            ← View Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
