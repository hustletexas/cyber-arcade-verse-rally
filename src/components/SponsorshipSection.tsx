import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Handshake, Mail, Monitor, Trophy, Users, Crown, Megaphone, Star, GraduationCap, Heart } from 'lucide-react';
const sponsorshipIncludes = [{
  icon: Monitor,
  text: 'Brand placement during events or streams'
}, {
  icon: Megaphone,
  text: 'Logo placement on the platform or promotional materials'
}, {
  icon: Trophy,
  text: 'Sponsored tournaments or challenges'
}, {
  icon: Users,
  text: 'Community engagement opportunities'
}];
const sponsorTiers = [{
  label: 'Community Sponsor',
  icon: Users,
  color: 'text-neon-cyan',
  border: 'border-neon-cyan/30',
  glow: 'shadow-[0_0_15px_hsl(var(--neon-cyan)/0.15)]'
}, {
  label: 'Event Sponsor',
  icon: Star,
  color: 'text-neon-green',
  border: 'border-neon-green/30',
  glow: 'shadow-[0_0_15px_hsl(var(--neon-green)/0.15)]'
}, {
  label: 'Tournament Sponsor',
  icon: Trophy,
  color: 'text-neon-purple',
  border: 'border-neon-purple/30',
  glow: 'shadow-[0_0_15px_hsl(var(--neon-purple)/0.15)]'
}, {
  label: 'Title Sponsor',
  icon: Crown,
  color: 'text-neon-pink',
  border: 'border-neon-pink/30',
  glow: 'shadow-[0_0_15px_hsl(var(--neon-pink)/0.15)]'
}, {
  label: 'Education Program',
  icon: GraduationCap,
  color: 'text-yellow-400',
  border: 'border-yellow-400/30',
  glow: 'shadow-[0_0_15px_hsl(50_100%_50%/0.15)]',
  description: 'Schools, universities & academic orgs'
}, {
  label: 'Youth Development',
  icon: Heart,
  color: 'text-emerald-400',
  border: 'border-emerald-400/30',
  glow: 'shadow-[0_0_15px_hsl(160_100%_50%/0.15)]',
  description: 'Nonprofits, city programs & youth orgs'
}];
export const SponsorshipSection = () => {
  return <section className="py-8 sm:py-12">
      {/* Section Header */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Handshake className="w-6 h-6 sm:w-7 sm:h-7 text-neon-cyan" />
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-neon-cyan tracking-wider">
            SPONSORSHIPS & PARTNERSHIPS
          </h2>
        </div>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
          Cyber City Arcade builds:{'\n\n'}🎯 Teamwork & Communication{'\n'}🧩 Problem-Solving & Critical Thinking{'\n'}🕹️ Digital Literacy & Tech Awareness{'\n'}🏆 Goal-Setting & Sportsmanship{'\n'}💡 Creativity & Strategic Thinking                   
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* What Sponsorships Include */}
        <Card className="holographic bg-card/40">
          <CardContent className="p-5 sm:p-8">
            <h3 className="font-display text-lg sm:text-xl text-neon-pink mb-5 tracking-wide">
              Sponsorships may include:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sponsorshipIncludes.map((item, i) => <div key={i} className="flex items-start gap-3 group">
                  <div className="mt-0.5 p-2 rounded-lg bg-card/60 border border-neon-cyan/20 group-hover:border-neon-cyan/50 transition-colors">
                    <item.icon className="w-4 h-4 text-neon-cyan" />
                  </div>
                  <p className="text-foreground/90 text-sm sm:text-base leading-relaxed">{item.text}</p>
                </div>)}
            </div>
            <p className="mt-6 text-muted-foreground text-xs sm:text-sm border-t border-border/40 pt-4">
              Sponsorships are marketing and promotional agreements and do not represent an investment
              or ownership interest in Cyber City Arcade.
            </p>
          </CardContent>
        </Card>

        {/* Sponsor Tiers */}
        <div>
          <h3 className="font-display text-lg sm:text-xl text-neon-purple mb-4 text-center tracking-wide">
            SPONSORSHIP TIERS
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {sponsorTiers.map(tier => <Card key={tier.label} className={`bg-card/30 backdrop-blur-sm border ${tier.border} ${tier.glow} hover:scale-105 transition-transform duration-300`}>
                <CardContent className="p-4 sm:p-5 flex flex-col items-center text-center gap-2">
                  <tier.icon className={`w-7 h-7 sm:w-8 sm:h-8 ${tier.color}`} />
                  <span className={`font-display text-xs sm:text-sm ${tier.color} tracking-wide`}>
                    {tier.label}
                  </span>
                  {'description' in tier && tier.description ? <p className="text-muted-foreground text-[10px] sm:text-xs leading-snug">{tier.description}</p> : <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/50 mt-1">
                      Branding + Exposure
                    </Badge>}
                </CardContent>
              </Card>)}
          </div>
        </div>

        {/* CTA */}
        <Card className="holographic bg-card/40 border-neon-pink/20">
          <CardContent className="p-5 sm:p-8 text-center">
            <h3 className="font-display text-lg sm:text-xl text-foreground mb-2">
              Interested in sponsoring Cyber City Arcade?
            </h3>
            <p className="text-muted-foreground text-sm mb-5">
              <Mail className="inline w-4 h-4 mr-1 -mt-0.5" />
              cybercityarcade@gmail.com
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild className="cyber-button px-6 py-3 text-sm sm:text-base w-full sm:w-auto">
                <a href="mailto:cybercityarcade@gmail.com">
                  📩 Request Sponsorship Info
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* On-chain Donations Transparency Note */}
        <div className="text-center">
          <p className="text-muted-foreground/60 text-xs max-w-lg mx-auto leading-relaxed">
            Community donations via USDC are accepted for platform support. Donations do not confer any ownership, equity, or financial return. Transaction transparency is maintained on-chain.
          </p>
        </div>
      </div>
    </section>;
};