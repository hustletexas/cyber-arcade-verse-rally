import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SponsorshipSection } from '@/components/SponsorshipSection';

const SponsorshipsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-3 sm:px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => { navigate('/'); window.scrollTo(0, 0); }}
          className="mb-6 text-neon-cyan hover:text-neon-cyan/80"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Arcade
        </Button>
        <SponsorshipSection />
      </div>
    </div>
  );
};

export default SponsorshipsPage;
