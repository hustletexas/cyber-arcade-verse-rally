import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  ShieldCheck,
  Users,
  GraduationCap,
  Handshake,
  Heart,
  CheckCircle2,
  Landmark,
  DollarSign,
  ClipboardCheck,
} from 'lucide-react';

const checks = [
  'Supervised after-school programming',
  'Structured, organized activities',
  'Clear behavioral expectations',
  'Reduced after-school idle time',
  'Minimal administrative burden',
];

const steps = [
  'School approves Cyber City Arcade as an after-school provider',
  'School shares program information with parents',
  'Parents complete registration and consent through Cyber City Arcade',
  'Program operates on campus with staff supervision',
];

const safetyItems = [
  'Adult supervision at all times',
  'Secure student check-in and check-out procedures',
  'Parent/guardian consent required',
  'Student code of conduct enforced',
  'No gambling, raffles, or cash-based prizes',
];

const insuranceItems = [
  'General Liability Insurance coverage',
  'Certificates of Insurance available upon request',
  'Staff background checks (as required by district policy)',
  'Compliance with school visitor and safety procedures',
];

const fundingOptions = [
  { label: 'School-funded enrichment', icon: Landmark },
  { label: 'Grant-supported programming', icon: ClipboardCheck },
  { label: 'Parent-paid enrollment', icon: DollarSign },
  { label: 'Sponsored student seats', icon: Heart },
];

const AfterSchoolProgram = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto max-w-4xl relative z-10">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6 text-neon-cyan hover:bg-neon-cyan/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Arcade
          </Button>

          <div className="flex justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-neon-cyan" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
            After-School Enrichment Program
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            School Partnership Overview
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-4xl px-4 pb-20 space-y-12">
        {/* Program Summary */}
        <Card className="border-neon-cyan/20 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-8 space-y-4">
            <h2 className="text-2xl font-display font-bold text-neon-cyan flex items-center gap-2">
              <Users className="h-6 w-6" />
              Program Summary
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Cyber City Arcade provides a structured, supervised after-school enrichment program
              that combines team-based gaming activities with problem-solving, collaboration, and
              responsible technology use.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our program supports positive student engagement after dismissal in a safe, monitored
              environment.
            </p>
            <div className="mt-4 p-4 rounded-lg bg-neon-cyan/5 border border-neon-cyan/20">
              <p className="text-sm font-semibold text-neon-cyan text-center">
                This is an enrichment program — not gambling, not raffles, and not prize-based
                competition.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What Schools Receive */}
        <Card className="border-neon-cyan/20 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-8 space-y-4">
            <h2 className="text-2xl font-display font-bold text-neon-cyan flex items-center gap-2">
              <GraduationCap className="h-6 w-6" />
              What Schools Receive
            </h2>
            <ul className="space-y-3">
              {checks.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-neon-cyan mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground italic mt-4">
              Cyber City Arcade operates as a third-party enrichment provider, handling registration
              and parent communication directly.
            </p>
          </CardContent>
        </Card>

        {/* How the Partnership Works */}
        <Card className="border-neon-cyan/20 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-8 space-y-4">
            <h2 className="text-2xl font-display font-bold text-neon-cyan flex items-center gap-2">
              <Handshake className="h-6 w-6" />
              How the Partnership Works
            </h2>
            <ol className="space-y-4">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-neon-cyan/20 text-neon-cyan font-bold text-sm shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground pt-1">{step}</span>
                </li>
              ))}
            </ol>
            <p className="text-sm text-muted-foreground italic mt-4">
              All enrollment, waivers, and attendance records are managed by Cyber City Arcade.
            </p>
          </CardContent>
        </Card>

        {/* Safety, Insurance & Compliance */}
        <Card className="border-neon-cyan/20 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-2xl font-display font-bold text-neon-cyan flex items-center gap-2">
              <ShieldCheck className="h-6 w-6" />
              Safety, Insurance & Compliance
            </h2>
            <p className="text-muted-foreground">
              Student safety and district compliance are priorities.
            </p>
            <ul className="space-y-3">
              {safetyItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-neon-cyan mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>

            <Separator className="bg-neon-cyan/20" />

            <p className="text-muted-foreground font-semibold">Cyber City Arcade maintains:</p>
            <ul className="space-y-3">
              {insuranceItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-neon-cyan mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground italic">
              We are prepared to meet district vendor onboarding requirements, including
              documentation and proof of coverage.
            </p>
          </CardContent>
        </Card>

        {/* Founder Vision */}
        <Card className="border-neon-pink/20 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-8 space-y-4">
            <h2 className="text-2xl font-display font-bold text-neon-pink flex items-center gap-2">
              <Heart className="h-6 w-6" />
              Founder Vision
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Cyber City Arcade was created with a simple goal: to provide students with a safe,
              engaging space where technology and gaming are used responsibly and constructively.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The mission is to help students build teamwork skills, confidence, and healthy digital
              habits while offering a supervised alternative during after-school hours. The program
              is built around structure, accountability, and respect — values that align with school
              communities.
            </p>
          </CardContent>
        </Card>

        {/* Flexible Funding Options */}
        <Card className="border-neon-cyan/20 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-2xl font-display font-bold text-neon-cyan flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Flexible Funding Options
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fundingOptions.map((opt) => (
                <div
                  key={opt.label}
                  className="flex items-center gap-3 p-4 rounded-lg bg-neon-cyan/5 border border-neon-cyan/20"
                >
                  <opt.icon className="h-5 w-5 text-neon-cyan shrink-0" />
                  <span className="text-muted-foreground">{opt.label}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground italic text-center">
              Program details are customized per school.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AfterSchoolProgram;
