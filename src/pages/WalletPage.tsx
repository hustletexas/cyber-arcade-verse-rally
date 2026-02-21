import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, Gamepad2, DollarSign, Trophy, ShoppingBag, Shield, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';

const featureCards = [
  {
    icon: Gamepad2,
    title: 'Enter Competitive Tournaments',
    description: 'Join paid tournaments and secure your entry on-chain.',
  },
  {
    icon: DollarSign,
    title: 'Receive Instant USDC Payouts',
    description: 'Winners get paid directly to their wallet — no waiting.',
  },
  {
    icon: Trophy,
    title: 'Track Your Wins On-Chain',
    description: 'Your victories are verified and recorded securely.',
  },
  {
    icon: ShoppingBag,
    title: 'Unlock Season Passes & Rewards',
    description: 'Access exclusive content and premium arcade features.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Create Your Wallet',
    description: 'Download LOBSTR or another supported Stellar wallet.',
  },
  {
    step: '02',
    title: 'Connect To Cyber City Arcade',
    description: 'Secure login with wallet authentication.',
  },
  {
    step: '03',
    title: 'Compete & Earn',
    description: 'Play. Win. Get Paid.',
  },
];

const faqItems = [
  {
    question: 'Is it safe?',
    answer: 'Yes. Your wallet is secured by blockchain cryptography. Only you control your private keys and authorize transactions. Cyber City Arcade never has access to your funds.',
  },
  {
    question: 'What if I lose access?',
    answer: 'Most wallets provide a recovery phrase when you create your account. Store it somewhere safe and offline. With your recovery phrase, you can restore your wallet on any device.',
  },
  {
    question: 'Do I need crypto experience?',
    answer: 'Not at all. Setting up a wallet takes under 2 minutes. We recommend LOBSTR — it\'s beginner-friendly and works on both mobile and desktop.',
  },
  {
    question: 'Are there fees?',
    answer: 'Stellar Network transactions have minimal fees (fractions of a cent). There are no hidden fees from Cyber City Arcade for wallet connections.',
  },
];

const controlPoints = [
  'Cyber City Arcade never holds your funds',
  'Transactions require your approval',
  'Secured by blockchain technology',
  'Transparent and verifiable',
];

const WalletPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--neon-cyan)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--neon-cyan)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Back button */}
      <div className="relative z-10 container mx-auto pt-6 px-4">
        <Button
          variant="ghost"
          onClick={() => { navigate('/'); window.scrollTo(0, 0); }}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Arcade
        </Button>
      </div>

      {/* HERO SECTION */}
      <section className="relative z-10 container mx-auto px-4 pt-12 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative inline-block mb-8">
            <div className="absolute -inset-4 rounded-full bg-accent/10 blur-2xl animate-pulse-glow" />
            <Wallet className="w-20 h-20 text-accent relative animate-float" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-display tracking-widest border border-accent/30 text-accent/80 mb-6">
            Powered by Stellar Network
          </span>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4">
            Your Wallet.{' '}
            <span className="text-accent">Your Power.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Secure your rewards. Own your wins. Get paid instantly.
          </p>
        </motion.div>
      </section>

      {/* SECTION 1 — What Is A Wallet? */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-6">
            What Is A <span className="text-accent">Wallet</span>?
          </h2>
          <div className="holographic p-8 space-y-4">
            <p className="text-muted-foreground text-lg leading-relaxed">
              A wallet is your secure digital locker.
              It allows you to hold rewards, enter tournaments, and receive payouts directly — without banks or middlemen.
            </p>
            <p className="text-foreground font-semibold text-lg">
              You stay in control at all times.
            </p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2 — Why You Need One */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground text-center mb-12">
            Why You Need One In{' '}
            <span className="text-neon-purple">Cyber City Arcade</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {featureCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="holographic h-full border-border/30 hover:border-accent/50 transition-colors group">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <card.icon className="w-7 h-7 text-accent" />
                    </div>
                    <h3 className="font-display text-sm font-bold text-foreground">{card.title}</h3>
                    <p className="text-muted-foreground text-sm">{card.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 3 — You Stay In Control */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="arcade-frame p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <Shield className="w-8 h-8 text-accent" />
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Your Money. Your Keys. Your Control.
              </h2>
            </div>
            <ul className="space-y-4 mb-6">
              {controlPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <span className="text-muted-foreground text-lg">{point}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground/60 border-t border-border/30 pt-4">
              All transactions occur on the Stellar Network.
            </p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 4 — How It Works */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground text-center mb-12">
            How It <span className="text-accent">Works</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="relative inline-block mb-4">
                  <span className="font-display text-5xl font-black text-accent/20">{s.step}</span>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-16 w-12 h-px bg-accent/30" />
                  )}
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 5 — FAQ */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground text-center mb-10">
            Frequently Asked <span className="text-accent">Questions</span>
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="holographic border-none px-6"
              >
                <AccordionTrigger className="text-foreground font-display text-sm hover:no-underline hover:text-accent transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </section>

      {/* LEGAL DISCLAIMER */}
      <section className="relative z-10 container mx-auto px-4 pt-8 pb-20">
        <p className="text-center text-xs text-muted-foreground/50 max-w-2xl mx-auto">
          Crypto involves risk. Cyber City Arcade does not provide financial advice. Users are responsible for managing their own wallets and private keys.
        </p>
      </section>
    </div>
  );
};

export default WalletPage;
