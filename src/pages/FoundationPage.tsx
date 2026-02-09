import React from 'react';
import { TopBar } from '@/components/TopBar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Monitor, Heart, Users, GraduationCap, Shield, Mail, ArrowLeft, Laptop, Gift, HandHeart, Lightbulb } from 'lucide-react';

const FoundationPage = () => {
  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Galaxy Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{
        background: `
          radial-gradient(ellipse 100% 60% at 50% 0%, rgba(100, 50, 150, 0.4) 0%, transparent 50%),
          radial-gradient(ellipse 80% 50% at 30% 70%, rgba(80, 40, 120, 0.3) 0%, transparent 45%),
          radial-gradient(ellipse 70% 50% at 70% 80%, rgba(60, 30, 100, 0.25) 0%, transparent 40%),
          linear-gradient(180deg, rgb(25, 15, 45) 0%, rgb(20, 12, 40) 30%, rgb(15, 10, 35) 60%, rgb(12, 8, 30) 100%)
        `
      }}>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.9) 1px, transparent 0),
            radial-gradient(1px 1px at 25% 45%, rgba(255,255,255,0.7) 1px, transparent 0),
            radial-gradient(1.5px 1.5px at 35% 15%, rgba(255,200,255,0.8) 1px, transparent 0),
            radial-gradient(1px 1px at 55% 35%, rgba(200,200,255,0.7) 1px, transparent 0),
            radial-gradient(1px 1px at 75% 25%, rgba(255,255,255,0.8) 1px, transparent 0),
            radial-gradient(1px 1px at 85% 55%, rgba(180,180,255,0.7) 1px, transparent 0),
            radial-gradient(1px 1px at 95% 10%, rgba(255,255,255,0.5) 1px, transparent 0),
            radial-gradient(1px 1px at 5% 65%, rgba(255,220,255,0.6) 1px, transparent 0),
            radial-gradient(1px 1px at 60% 95%, rgba(200,220,255,0.6) 1px, transparent 0)
          `,
          backgroundSize: '250px 250px'
        }} />
      </div>

      <TopBar />

      <main className="container mx-auto px-4 py-8 relative z-10 max-w-4xl">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-neon-cyan hover:text-neon-purple transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Arcade
        </Link>

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 mb-6">
            <Laptop className="w-10 h-10 text-neon-cyan" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-neon-cyan mb-4">
            Computer Access Program
          </h1>
          <p className="text-lg text-neon-purple font-display tracking-wider mb-2">
            Cyber City Arcade Foundation
          </p>
          <div className="inline-block bg-neon-cyan/10 border border-neon-cyan/30 rounded-full px-6 py-3 mt-4">
            <p className="text-xl sm:text-2xl font-bold text-neon-cyan">
              💻 One Computer. One Kid. Every Month.
            </p>
          </div>
        </div>

        {/* Mission Statement */}
        <Card className="arcade-frame mb-8">
          <CardContent className="p-6 sm:p-8">
            <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
              The Cyber City Arcade Foundation's Computer Access Program is a community initiative focused on
              reducing the digital divide by providing <span className="text-neon-cyan font-semibold">one computer per month</span> to
              a child or student in need.
            </p>
            <p className="text-muted-foreground leading-relaxed text-base sm:text-lg mt-4">
              Access to a computer is essential for education, creativity, and future opportunity. This program
              exists to ensure that at least one young person each month receives the tools they need to learn,
              grow, and succeed in today's digital world.
            </p>
          </CardContent>
        </Card>

        {/* Program Goals */}
        <Card className="arcade-frame mb-8">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-display font-bold text-neon-pink flex items-center gap-3 mb-6">
              <Lightbulb className="w-6 h-6" />
              Program Goals
            </h2>
            <div className="grid gap-4">
              {[
                { icon: Monitor, text: 'Provide one functional computer each month to a qualifying recipient' },
                { icon: GraduationCap, text: 'Support students who lack reliable access to technology at home' },
                { icon: Lightbulb, text: 'Encourage learning, creativity, and digital skill development' },
                { icon: Shield, text: 'Promote responsible and positive use of technology' },
              ].map((goal, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-black/20">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                    <goal.icon className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed pt-2">{goal.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="arcade-frame mb-8">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-display font-bold text-neon-purple flex items-center gap-3 mb-6">
              <Gift className="w-6 h-6" />
              How It Works
            </h2>
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Computers may be <span className="text-neon-cyan font-medium">new or professionally refurbished</span>.
                Recipients are selected based on community need, availability of resources, and outreach partnerships.
              </p>
              <div className="pl-4 border-l-2 border-neon-purple/30 space-y-2">
                <p className="text-sm text-muted-foreground font-medium text-neon-purple">Distribution may occur through:</p>
                {['Families and guardians', 'Schools or educators', 'Community organizations or youth programs'].map((item, i) => (
                  <p key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
                    {item}
                  </p>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/70 italic mt-4">
                The Foundation reserves the right to adjust program timing, selection criteria, or availability based on resources.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Who This Program Is For */}
        <Card className="arcade-frame mb-8">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-display font-bold text-neon-green flex items-center gap-3 mb-6">
              <Users className="w-6 h-6" />
              Who This Program Is For
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mb-4">
              The Computer Access Program is intended to support:
            </p>
            <div className="grid gap-3">
              {[
                'Students from low-income households',
                'Youth participating in educational or community programs',
                'Families facing temporary financial hardship',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-black/20">
                  <Heart className="w-4 h-4 text-neon-pink flex-shrink-0" />
                  <span className="text-muted-foreground text-sm">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/70 italic mt-4">
              Participation is not guaranteed and is subject to available funding and resources.
            </p>
          </CardContent>
        </Card>

        {/* How the Program Is Supported */}
        <Card className="arcade-frame mb-8">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-display font-bold text-neon-cyan flex items-center gap-3 mb-6">
              <HandHeart className="w-6 h-6" />
              How the Program Is Supported
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mb-4">
              This program may be supported through:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                'Donations and sponsorships',
                'Community partnerships',
                'Special fundraising initiatives',
                'Optional contributions tied to Cyber City Arcade events',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-black/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-green flex-shrink-0" />
                  <span className="text-muted-foreground text-sm">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-neon-purple/5 border border-neon-purple/20">
              <p className="text-xs text-muted-foreground">
                ⚠️ Contributions support community programs and do not provide ownership, financial returns, or investment benefits.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Transparency */}
        <Card className="arcade-frame mb-8">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-display font-bold text-yellow-400 flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6" />
              Transparency & Responsibility
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mb-4">
              The Cyber City Arcade Foundation is committed to:
            </p>
            <div className="grid gap-3">
              {[
                'Responsible use of funds',
                'Ethical selection and distribution practices',
                'Transparency in program goals and outcomes',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-black/20">
                  <span className="text-yellow-400">✓</span>
                  <span className="text-muted-foreground text-sm">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-neon-cyan text-sm font-medium mt-6 text-center">
              We strive to make a real, measurable impact—starting with one child at a time.
            </p>
          </CardContent>
        </Card>

        {/* Get Involved CTA */}
        <Card className="arcade-frame mb-12">
          <CardContent className="p-6 sm:p-8 text-center">
            <h2 className="text-2xl font-display font-bold text-neon-cyan mb-4">
              Get Involved
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mb-6">
              If you would like to support, sponsor, or help identify recipients for the Computer Access Program, contact us:
            </p>
            <a
              href="mailto:support@cybercityarcade.com?subject=Computer Access Program"
              className="inline-flex items-center gap-2"
            >
              <Button className="cyber-button text-base px-8 py-3">
                <Mail className="w-5 h-5 mr-2" />
                support@cybercityarcade.com
              </Button>
            </a>
            <p className="text-xs text-muted-foreground mt-3">
              Subject: Computer Access Program
            </p>
          </CardContent>
        </Card>

        {/* Footer Nav */}
        <div className="text-center pb-8">
          <Link to="/" className="text-neon-cyan hover:text-neon-purple transition-colors text-sm underline">
            ← Back to Cyber City Arcade
          </Link>
        </div>
      </main>
    </div>
  );
};

export default FoundationPage;
