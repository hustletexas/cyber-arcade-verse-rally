import React from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const footerSections = [
  {
    title: 'Shop',
    links: [
      { label: 'All Products', action: 'scroll-top' },
      { label: 'Limited Drops', action: 'scroll-limited' },
    ]
  },
  {
    title: 'Esports',
    links: [
      { label: 'Tournaments', path: '/tournaments' },
      { label: 'Rules', path: '/tournament-rules' },
    ]
  },
  {
    title: 'Rewards',
    links: [
      { label: 'Rewards Hub', path: '/rewards' },
    ]
  },
  {
    title: 'About',
    links: [
      { label: 'About Us', path: '/about' },
      { label: 'Foundation', path: '/foundation' },
    ]
  },
  {
    title: 'Contact',
    links: [
      { label: 'cybercityarcade@gmail.com', action: 'email' },
    ]
  }
];

export const StoreFooter = () => {
  const navigate = useNavigate();

  const handleLink = (link: any) => {
    if (link.path) navigate(link.path);
    if (link.action === 'email') window.location.href = 'mailto:cybercityarcade@gmail.com';
    if (link.action === 'scroll-top') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="pb-24 pt-8 px-6 border-t border-white/5">
      <div className="max-w-sm mx-auto space-y-1">
        {footerSections.map((section, i) => (
          <Collapsible key={i}>
            <CollapsibleTrigger className="w-full flex items-center justify-between py-3 text-white/60 hover:text-white/80 transition-colors">
              <span className="font-display text-sm tracking-wider">{section.title}</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pb-3 pl-2 space-y-2">
                {section.links.map((link, j) => (
                  <button
                    key={j}
                    onClick={() => handleLink(link)}
                    className="block text-sm text-white/40 hover:text-[#00E5FF] transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      <div className="text-center mt-8 space-y-1">
        <p className="text-white/30 text-xs">© 2025 Cyber City Arcade LLC</p>
        <p className="text-white/20 text-[10px]">Powered by Stellar Blockchain</p>
      </div>
    </footer>
  );
};
