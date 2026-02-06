import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  const lastUpdated = "January 20, 2026";

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
              <h2 className="text-xl text-neon-pink mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Cyber Arcade Verse ("the Platform"), you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services. These terms constitute a legally binding 
                agreement between you and Cyber Arcade Verse.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">2. Eligibility</h2>
              <p className="text-muted-foreground leading-relaxed">
                You must be at least 18 years old to use this Platform. By using our services, you represent and warrant that 
                you are of legal age in your jurisdiction to form a binding contract. Users under 18 may only use the Platform 
                under the supervision of a parent or legal guardian who agrees to be bound by these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">3. Account Responsibilities</h2>
              <p className="text-muted-foreground leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials, including wallet private keys. 
                You agree to notify us immediately of any unauthorized use of your account. We are not liable for any losses 
                resulting from unauthorized access to your account due to your failure to safeguard your credentials.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">4. Cryptocurrency & Digital Assets</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong className="text-neon-cyan">4.1 Risk Acknowledgment:</strong> Cryptocurrency and digital asset transactions 
                involve significant risks including volatility, regulatory uncertainty, and potential total loss of value. You 
                acknowledge and accept these risks when using our Platform.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong className="text-neon-cyan">4.2 CCC Tokens:</strong> CCC tokens are utility tokens for use within the 
                Platform ecosystem. They are not securities, investments, or currency. CCC tokens have no guaranteed value 
                outside the Platform.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong className="text-neon-cyan">4.3 Wallet Security:</strong> You are solely responsible for securing your 
                cryptocurrency wallets. We do not store private keys on our servers. Lost private keys cannot be recovered.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-neon-cyan">4.4 Transaction Finality:</strong> Blockchain transactions are irreversible. 
                We cannot reverse, cancel, or refund any cryptocurrency transactions once confirmed on the blockchain.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">5. NFTs & Digital Collectibles</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong className="text-neon-cyan">5.1 Ownership:</strong> NFT purchases grant you ownership of the token on the 
                blockchain, not necessarily the underlying intellectual property unless explicitly stated.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong className="text-neon-cyan">5.2 No Guarantees:</strong> We make no guarantees regarding the future value, 
                transferability, or utility of any NFTs purchased on this Platform.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-neon-cyan">5.3 Gas Fees:</strong> You are responsible for all network transaction fees 
                (gas fees) associated with NFT minting, transfers, and purchases.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">6. Gaming & Tournaments</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong className="text-neon-cyan">6.1 Fair Play:</strong> You agree to participate in all games and tournaments 
                fairly. Cheating, exploiting bugs, using automated tools, or any form of manipulation is strictly prohibited.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong className="text-neon-cyan">6.2 Entry Fees:</strong> Tournament entry fees are non-refundable once a 
                tournament has begun. Refunds for cancelled tournaments will be processed within 7 business days.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong className="text-neon-cyan">6.3 Prizes:</strong> Prize distributions are final once confirmed. We reserve 
                the right to withhold prizes if fraud or cheating is detected.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-neon-cyan">6.4 Skill-Based Gaming:</strong> Games on this Platform are skill-based. 
                Outcomes depend on player skill and performance, not chance.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">7. Raffles & Promotions</h2>
              <p className="text-muted-foreground leading-relaxed">
                Raffles are conducted using verifiable random selection methods. Participation in raffles is subject to 
                applicable local laws. Void where prohibited. Winners are responsible for any taxes on prizes. 
                We reserve the right to modify or cancel raffles at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">8. Prohibited Activities</h2>
              <p className="text-muted-foreground leading-relaxed">
                You may not: (a) use the Platform for money laundering or illegal activities; (b) attempt to manipulate 
                markets or prices; (c) harass other users; (d) infringe on intellectual property rights; (e) use bots or 
                automated systems to gain unfair advantages; (f) circumvent security measures; (g) impersonate others.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">9. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content on this Platform, including but not limited to graphics, logos, music, and software, is owned 
                by Cyber Arcade Verse or its licensors. You may not reproduce, distribute, or create derivative works 
                without express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">10. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, CYBER ARCADE VERSE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR DIGITAL ASSETS. OUR TOTAL 
                LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE PAST 12 MONTHS.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">11. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE UNINTERRUPTED ACCESS, 
                ERROR-FREE OPERATION, OR THAT THE PLATFORM WILL MEET YOUR EXPECTATIONS. CRYPTOCURRENCY VALUES CAN FLUCTUATE 
                DRAMATICALLY AND YOU MAY LOSE YOUR ENTIRE INVESTMENT.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">12. Dispute Resolution</h2>
              <p className="text-muted-foreground leading-relaxed">
                Any disputes arising from these Terms shall be resolved through binding arbitration in accordance with 
                applicable arbitration rules. You waive any right to participate in class action lawsuits or class-wide 
                arbitration. This agreement shall be governed by applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">13. Modifications</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. Continued use of the Platform after changes 
                constitutes acceptance of the new Terms. We will notify users of material changes via email or Platform 
                notification.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-neon-pink mb-3">14. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms, please contact us at: support@cyberarcadeverse.com
              </p>
            </section>

            <div className="pt-6 border-t border-neon-cyan/20">
              <p className="text-sm text-muted-foreground text-center">
                By using Cyber Arcade Verse, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link to="/privacy" className="text-neon-cyan hover:text-neon-pink transition-colors">
            View Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
