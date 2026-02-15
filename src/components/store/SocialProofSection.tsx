import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  { text: "Worn in real tournaments.", author: "— Houston Player" },
  { text: "Premium quality and insane design.", author: "— Competitive Gamer" },
];

export const SocialProofSection = () => {
  return (
    <section className="py-12 px-6">
      <h2 className="font-display text-lg text-center text-white/80 tracking-wider mb-6">
        TRUSTED BY COMPETITIVE PLAYERS
      </h2>

      <div className="max-w-sm mx-auto space-y-6">
        {testimonials.map((t, i) => (
          <div key={i} className="rounded-xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-[#FF2FAF] text-[#FF2FAF]" />
              ))}
            </div>
            <p className="text-white/70 text-sm italic mb-2">"{t.text}"</p>
            <p className="text-white/40 text-xs">{t.author}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
