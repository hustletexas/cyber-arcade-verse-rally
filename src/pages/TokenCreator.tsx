import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CCTRTokenCreator from '@/components/CCTRTokenCreator';
import { TokenMetadataGenerator } from '@/components/TokenMetadataGenerator';
import { TopBar } from '@/components/TopBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileJson, Coins } from 'lucide-react';

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

        <div className="max-w-2xl mx-auto space-y-6">
          <Tabs defaultValue="metadata" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="metadata" className="flex items-center gap-2">
                <FileJson className="h-4 w-4" />
                1. Generate Metadata
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                2. Create Token
              </TabsTrigger>
            </TabsList>
            <TabsContent value="metadata" className="mt-6">
              <TokenMetadataGenerator />
            </TabsContent>
            <TabsContent value="create" className="mt-6">
              <CCTRTokenCreator />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TokenCreator;
