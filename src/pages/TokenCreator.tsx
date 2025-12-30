import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CCTRTokenCreator from '@/components/CCTRTokenCreator';
import { TopBar } from '@/components/TopBar';

const TokenCreator = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="max-w-2xl mx-auto">
          <CCTRTokenCreator />
        </div>
      </div>
    </div>
  );
};

export default TokenCreator;
