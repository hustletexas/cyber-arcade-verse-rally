
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TournamentCalendar } from "@/components/TournamentCalendar";
import { NFTCreationHub } from "@/components/nft";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-[url('/lovable-uploads/d02c55c8-cdcf-4072-814b-340278e7ba0d.png')] bg-cover bg-center opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <Badge className="mb-4 bg-neon-pink text-black text-lg px-6 py-2 animate-pulse">
              🚀 LIVE NOW - CYBER CITY GAMING
            </Badge>
            <h1 className="font-display text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-green mb-6 animate-pulse">
              CYBER CITY
            </h1>
            <p className="text-xl md:text-2xl text-neon-cyan mb-8 max-w-3xl mx-auto leading-relaxed">
              The ultimate Web3 gaming destination where retro meets future. 
              <span className="text-neon-pink font-bold"> Tournament gaming</span>, 
              <span className="text-neon-green font-bold"> NFT creation</span>, and 
              <span className="text-neon-purple font-bold"> community rewards</span> 
              all powered by blockchain technology.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="cyber-button text-lg px-8 py-4">
                🎮 START GAMING
              </Button>
              <Button className="neon-border bg-transparent text-neon-cyan border-2 border-neon-cyan hover:bg-neon-cyan hover:text-black text-lg px-8 py-4">
                💰 BUY $CCTR
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* NFT Creation Hub - Premium Feature */}
        <section>
          <NFTCreationHub />
        </section>

        {/* Tournament Calendar */}
        <section>
          <TournamentCalendar />
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="holographic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neon-pink">
                🎮 Tournaments
                <Badge className="bg-neon-green text-black">LIVE</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Compete in retro gaming tournaments with $CCTR prizes
              </p>
            </CardContent>
          </Card>

          <Card className="vending-machine">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neon-cyan">
                🎨 NFT Studio
                <Badge className="bg-neon-yellow text-black">NEW</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create premium music & art NFTs with our professional tools
              </p>
            </CardContent>
          </Card>

          <Card className="arcade-frame">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neon-purple">
                💰 Token Economy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Earn, stake, and trade $CCTR tokens across the ecosystem
              </p>
            </CardContent>
          </Card>

          <Card className="holographic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neon-green">
                🌐 Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Join thousands of gamers in the ultimate Web3 gaming hub
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center p-6 arcade-frame">
            <div className="text-3xl font-bold text-neon-green">10K+</div>
            <div className="text-sm text-muted-foreground">Active Players</div>
          </Card>
          <Card className="text-center p-6 arcade-frame">
            <div className="text-3xl font-bold text-neon-cyan">$50K+</div>
            <div className="text-sm text-muted-foreground">Prize Pool</div>
          </Card>
          <Card className="text-center p-6 arcade-frame">
            <div className="text-3xl font-bold text-neon-purple">1000+</div>
            <div className="text-sm text-muted-foreground">NFTs Created</div>
          </Card>
          <Card className="text-center p-6 arcade-frame">
            <div className="text-3xl font-bold text-neon-pink">24/7</div>
            <div className="text-sm text-muted-foreground">Gaming Action</div>
          </Card>
        </section>
      </div>
    </div>
  );
}
