import React from 'react';
import { MapPin, ShieldCheck, Package, Users } from 'lucide-react';

const trustItems = [
  { icon: MapPin, label: 'Houston Built' },
  { icon: ShieldCheck, label: 'Secure Checkout' },
  { icon: Package, label: 'Limited Production' },
  { icon: Users, label: 'All Ages Esports' },
];

export const TrustSection = () => {
  return (
    <section className="py-10 px-6">
      <div className="max-w-sm mx-auto space-y-4">
        {trustItems.map((item, i) => (
          <div key={i} className="flex items-center gap-4 text-white/70">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)' }}>
              <item.icon className="h-5 w-5 text-[#00E5FF]" />
            </div>
            <span className="font-display text-sm tracking-wider">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
