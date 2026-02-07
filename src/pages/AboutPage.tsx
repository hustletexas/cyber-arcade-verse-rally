import React from 'react';
import { TopBar } from '@/components/TopBar';
import { CartDrawer } from '@/components/CartDrawer';
import { ArrowLeft, Users, Target, Rocket, Handshake, Mail, Globe, Shield, Gamepad2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const teamMembers = [
  {
    name: 'Founder & CEO',
    role: 'Vision & Strategy',
    bio: 'Passionate about using gaming to empower youth and build stronger communities through digital literacy.',
    icon: Rocket,
  },
  {
    name: 'Community Director',
    role: 'Youth Programs',
    bio: 'Dedicated to creating safe, inclusive gaming environments where young people can thrive and connect.',
    icon: Heart,
  },
  {
    name: 'Lead Developer',
    role: 'Web3 & Gaming Tech',
    bio: 'Building next-gen arcade experiences powered by blockchain technology and competitive multiplayer gameplay.',
    icon: Gamepad2,
  },
  {
    name: 'Operations Lead',
    role: 'Partnerships & Events',
    bio: 'Coordinating tournament logistics, sponsor relationships, and community outreach initiatives.',
    icon: Shield,
  },
];

const roadmapItems = [
  {
    phase: 'Phase 1',
    title: 'Foundation',
    status: 'completed' as const,
    items: [
      'Launch Cyber City Arcade platform',
      'Deploy Cyber Match, Sequence & Trivia games',
      'Integrate digital wallet support',
      'Build community hub & after school program',
    ],
  },
  {
    phase: 'Phase 2',
    title: 'Expansion',
    status: 'active' as const,
    items: [
      'NFT Season Pass & Cyber Chests',
      'Live tournament bracket system',
      'Weekly reward distribution',
      'AI Gaming Coach integration',
    ],
  },
  {
    phase: 'Phase 3',
    title: 'Growth',
    status: 'upcoming' as const,
    items: [
      'Mobile-first gaming experience',
      'Create esports team',
      'Youth program partnerships',
      'Regional arcade hub events',
    ],
  },
  {
    phase: 'Phase 4',
    title: 'Scale',
    status: 'upcoming' as const,
    items: [
      'Global esports league',
      'Scholarship fund via gaming rewards',
      'DAO-governed community decisions',
      'Metaverse arcade integration',
    ],
  },
];

const partners = [
  { name: 'Stellar Network', description: 'Blockchain infrastructure & payments' },
];

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <TopBar />
      <CartDrawer />

      {/* Hero */}
      <section className="relative py-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/10 via-transparent to-transparent" />
        <div className="relative z-10 container mx-auto max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6 text-neon-cyan hover:bg-neon-cyan/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Arcade
          </Button>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            About <span className="text-neon-cyan">Cyber City Arcade</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Where gaming meets purpose — empowering youth through competition, teamwork, and digital innovation.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="arcade-frame rounded-xl p-8 md:p-12 bg-card/30 backdrop-blur-sm border border-neon-cyan/20">
            <div className="flex items-center gap-3 mb-6">
              <Target className="h-7 w-7 text-neon-pink" />
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Our Mission</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              We believe gaming can be more than entertainment — it can be a tool for learning, teamwork, and positive youth development when responsibly guided.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {[
                { icon: Users, title: 'Teamwork', desc: 'Building collaborative skills through multiplayer competition and community events.' },
                { icon: Globe, title: 'Digital Literacy', desc: 'Teaching Web3, blockchain, and responsible digital citizenship through play.' },
                { icon: Shield, title: 'Safe Spaces', desc: 'Creating supervised environments where youth can game, learn, and grow together.' },
              ].map((pillar) => (
                <div key={pillar.title} className="p-5 rounded-lg bg-card/40 border border-neon-purple/20 hover:border-neon-cyan/40 transition-colors">
                  <pillar.icon className="h-8 w-8 text-neon-cyan mb-3" />
                  <h3 className="font-display text-sm font-bold text-foreground mb-2">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <Users className="h-7 w-7 text-neon-cyan" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">The Team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="arcade-frame rounded-xl p-6 bg-card/30 backdrop-blur-sm border border-neon-purple/20 hover:border-neon-pink/40 transition-all group text-center"
              >
                <div className="w-16 h-16 rounded-full bg-neon-pink/10 border border-neon-pink/30 flex items-center justify-center mx-auto mb-4 group-hover:border-neon-cyan/50 transition-colors">
                  <member.icon className="h-7 w-7 text-neon-pink group-hover:text-neon-cyan transition-colors" />
                </div>
                <h3 className="font-display text-sm font-bold text-foreground mb-1">{member.name}</h3>
                <p className="text-xs text-neon-cyan mb-3">{member.role}</p>
                <p className="text-xs text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <Rocket className="h-7 w-7 text-neon-pink" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Roadmap</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roadmapItems.map((phase) => (
              <div
                key={phase.phase}
                className={`arcade-frame rounded-xl p-6 bg-card/30 backdrop-blur-sm border transition-colors ${
                  phase.status === 'completed'
                    ? 'border-neon-green/40'
                    : phase.status === 'active'
                    ? 'border-neon-cyan/40 ring-1 ring-neon-cyan/20'
                    : 'border-neon-purple/20'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`font-display text-xs font-bold px-3 py-1 rounded-full ${
                      phase.status === 'completed'
                        ? 'bg-neon-green/20 text-neon-green'
                        : phase.status === 'active'
                        ? 'bg-neon-cyan/20 text-neon-cyan'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {phase.phase}
                  </span>
                  <h3 className="font-display text-lg font-bold text-foreground">{phase.title}</h3>
                </div>
                <ul className="space-y-2">
                  {phase.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span
                        className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
                          phase.status === 'completed'
                            ? 'bg-neon-green'
                            : phase.status === 'active'
                            ? 'bg-neon-cyan'
                            : 'bg-muted-foreground/50'
                        }`}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <Handshake className="h-7 w-7 text-neon-cyan" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Partners & Ecosystem</h2>
          </div>
          <div className="flex justify-center">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="arcade-frame rounded-xl p-6 bg-card/30 backdrop-blur-sm border border-neon-purple/20 hover:border-neon-cyan/40 transition-colors text-center"
              >
                <h3 className="font-display text-base font-bold text-foreground mb-2">{partner.name}</h3>
                <p className="text-sm text-muted-foreground">{partner.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <div className="arcade-frame rounded-xl p-8 bg-card/30 backdrop-blur-sm border border-neon-pink/30">
            <Mail className="h-10 w-10 text-neon-pink mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-foreground mb-3">Get In Touch</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Want to partner, sponsor, or just say hello? Reach out to us.
            </p>
            <a
              href="mailto:cybercityarcade@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-neon-pink/20 border border-neon-pink/40 text-neon-pink hover:bg-neon-pink/30 transition-colors font-display text-sm"
            >
              <Mail className="h-4 w-4" />
              cybercityarcade@gmail.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
