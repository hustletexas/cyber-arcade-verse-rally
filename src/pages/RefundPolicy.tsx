import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { Link } from "react-router-dom";

const RefundPolicy = () => {
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
              <ReceiptText className="h-8 w-8 text-neon-cyan" />
              <div>
                <CardTitle className="text-2xl md:text-3xl text-neon-cyan">Refund Policy</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Last Updated: {lastUpdated}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none p-6 space-y-6">

            <section>
              <p className="text-muted-foreground leading-relaxed">
                Cyber City Arcade provides digital products, including optional digital collectibles (NFTs) and access-based digital content, delivered electronically.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neon-pink mb-3">Digital Product Sales</h2>
              <p className="text-muted-foreground leading-relaxed">
                All purchases of digital products, including NFTs and digital access passes, are final once delivered, except as required by applicable law.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Because NFTs and digital access are delivered instantly and cannot be returned in the traditional sense, refunds are generally not provided.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neon-pink mb-3">Eligible Refunds</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                A refund may be considered only in the following cases:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                <li>The digital asset or access was not delivered due to a verified technical error on our platform</li>
                <li>The customer was incorrectly charged or charged multiple times for the same purchase</li>
                <li>The product is materially different from what was described at the time of purchase</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Refund requests must be submitted within <span className="text-neon-cyan font-semibold">7 days</span> of the purchase date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neon-pink mb-3">Non-Refundable Situations</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Refunds will not be issued for:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                <li>Buyer's remorse or accidental purchases</li>
                <li>Changes in perceived value or market conditions</li>
                <li>Inability to use the product due to third-party wallet issues</li>
                <li>Loss of access caused by user error (wrong wallet address, lost credentials, etc.)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neon-pink mb-3">How to Request a Refund</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                To request a refund, contact us at:
              </p>
              <p className="text-neon-cyan font-mono">
                <a href="mailto:support@cybercityarcade.com" className="hover:text-neon-purple transition-colors underline">
                  support@cybercityarcade.com
                </a>
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3 mb-2">
                Please include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                <li>Order ID or transaction reference</li>
                <li>Wallet address used (if applicable)</li>
                <li>Description of the issue</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                All requests are reviewed on a case-by-case basis.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neon-pink mb-3">Chargebacks & Disputes</h2>
              <p className="text-muted-foreground leading-relaxed">
                We encourage customers to contact Cyber City Arcade before initiating a chargeback. Unauthorized or abusive chargebacks may result in account restrictions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neon-pink mb-3">Policy Changes</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cyber City Arcade reserves the right to update this Refund Policy at any time. Changes will be posted on this page.
              </p>
            </section>

            <div className="pt-6 border-t border-neon-cyan/20 flex flex-wrap gap-4">
              <Link to="/terms">
                <Button variant="outline" className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10">
                  Terms of Service
                </Button>
              </Link>
              <Link to="/privacy">
                <Button variant="outline" className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10">
                  Privacy Policy
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RefundPolicy;
