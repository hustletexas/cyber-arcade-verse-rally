import React from 'react';
import { TopBar } from '@/components/TopBar';
import { CyberSlotsMachine } from '@/components/CyberSlotsMachine';
import { CartDrawer } from '@/components/CartDrawer';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CCCBalanceBar } from '@/components/games/CCCBalanceBar';

const CyberSlotsPage = () => {
  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Galaxy Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{
        background: `
          radial-gradient(ellipse 100% 60% at 50% 0%, rgba(100, 50, 150, 0.4) 0%, transparent 50%),
          radial-gradient(ellipse 80% 50% at 30% 70%, rgba(80, 40, 120, 0.3) 0%, transparent 45%),
          radial-gradient(ellipse 70% 50% at 70% 80%, rgba(60, 30, 100, 0.25) 0%, transparent 40%),
          linear-gradient(180deg, 
            rgb(25, 15, 45) 0%, 
            rgb(20, 12, 40) 30%,
            rgb(15, 10, 35) 60%,
            rgb(12, 8, 30) 100%)
        `
      }}>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.9) 1px, transparent 0),
            radial-gradient(1px 1px at 25% 45%, rgba(255,255,255,0.7) 1px, transparent 0),
            radial-gradient(1.5px 1.5px at 35% 15%, rgba(255,200,255,0.8) 1px, transparent 0),
            radial-gradient(1px 1px at 45% 75%, rgba(255,255,255,0.6) 1px, transparent 0),
            radial-gradient(1px 1px at 55% 35%, rgba(200,200,255,0.7) 1px, transparent 0),
            radial-gradient(1.5px 1.5px at 65% 85%, rgba(255,180,255,0.6) 1px, transparent 0),
            radial-gradient(1px 1px at 75% 25%, rgba(255,255,255,0.8) 1px, transparent 0),
            radial-gradient(1px 1px at 85% 55%, rgba(180,180,255,0.7) 1px, transparent 0)
          `,
          backgroundSize: '250px 250px'
        }} />
      </div>

      <TopBar />
      
     <main className="container mx-auto px-2 sm:px-3 pt-0 pb-2 relative z-10 flex flex-col">
       {/* Header with Back Button */}
       <div className="flex items-center justify-between mb-1">
         <Link to="/">
           <Button variant="ghost" className="text-neon-purple hover:bg-neon-purple/10 border border-neon-purple/30 h-8 text-xs px-3">
             <ArrowLeft className="w-3 h-3 mr-1" />
             Back to Arcade
           </Button>
         </Link>
       </div>

       {/* CCC Balance Bar */}
       <div className="mb-1">
         <CCCBalanceBar />
       </div>

       {/* Main Content */}
        <div className="w-full">
          <CyberSlotsMachine onWin={(rarity, tokens) => {
            console.log(`Won ${tokens} CCC and ${rarity} chest!`);
          }} />
        </div>
      </main>

      <CartDrawer />
    </div>
  );
};

export default CyberSlotsPage;