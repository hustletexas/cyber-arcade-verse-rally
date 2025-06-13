
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Mock data for CCTR token chart
const mockChartData = [
  { time: '00:00', price: 0.045, volume: 12500 },
  { time: '04:00', price: 0.048, volume: 15600 },
  { time: '08:00', price: 0.052, volume: 18700 },
  { time: '12:00', price: 0.049, volume: 14200 },
  { time: '16:00', price: 0.055, volume: 22100 },
  { time: '20:00', price: 0.058, volume: 19800 },
  { time: '24:00', price: 0.061, volume: 25300 },
];

// Mock Solana assets data
const mockSolanaAssets = [
  { symbol: 'SOL', name: 'Solana', price: 98.45, change: '+5.2%', marketCap: '42.1B' },
  { symbol: 'CCTR', name: 'Cyber City Arcade Token', price: 0.061, change: '+35.6%', marketCap: '2.3M' },
  { symbol: 'RAY', name: 'Raydium', price: 2.34, change: '+12.8%', marketCap: '890M' },
  { symbol: 'ORCA', name: 'Orca', price: 1.89, change: '-2.1%', marketCap: '445M' },
  { symbol: 'SRM', name: 'Serum', price: 0.45, change: '+8.3%', marketCap: '234M' },
  { symbol: 'STEP', name: 'Step Finance', price: 0.12, change: '+15.7%', marketCap: '89M' },
];

export const SolanaDexChart = () => {
  const { toast } = useToast();
  const [selectedAsset, setSelectedAsset] = useState('CCTR');
  const [swapAmount, setSwapAmount] = useState('');
  const [activeTab, setActiveTab] = useState('chart');

  const handleSwap = () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid swap amount",
        variant: "destructive",
      });
      return;
    }

    // Simulate swap transaction
    toast({
      title: "🚀 Swap Initiated!",
      description: `Swapping ${swapAmount} SOL for CCTR tokens...`,
    });

    // Simulate completion after delay
    setTimeout(() => {
      toast({
        title: "✅ Swap Completed!",
        description: `Successfully swapped ${swapAmount} SOL for ${(parseFloat(swapAmount) * 16.39).toFixed(2)} CCTR`,
      });
      setSwapAmount('');
    }, 3000);
  };

  const openJupiterSwap = () => {
    const jupiterUrl = `https://jup.ag/swap/SOL-CCTR`;
    window.open(jupiterUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl md:text-2xl text-neon-green flex items-center gap-3 flex-wrap">
            📊 SOLANA DEX ANALYTICS
            <Badge className="bg-neon-cyan text-black animate-neon-flicker">LIVE DATA</Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 arcade-frame p-2">
          <TabsTrigger value="chart" className="cyber-button text-xs md:text-sm">
            📈 CHART
          </TabsTrigger>
          <TabsTrigger value="assets" className="cyber-button text-xs md:text-sm">
            🪙 ASSETS
          </TabsTrigger>
          <TabsTrigger value="swap" className="cyber-button text-xs md:text-sm">
            🔄 SWAP
          </TabsTrigger>
          <TabsTrigger value="tokenomics" className="cyber-button text-xs md:text-sm">
            📋 TOKENOMICS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-4">
          <Card className="holographic p-4 md:p-6">
            <h3 className="font-display text-lg md:text-xl text-neon-cyan mb-4">$CCTR Price Chart (24H)</h3>
            <div className="h-64 md:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ffff" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00ffff" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="time" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #00ffff',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#00ffff" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="text-lg font-bold text-neon-green">$0.061</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">24h Change</p>
                <p className="text-lg font-bold text-neon-cyan">+35.6%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-lg font-bold text-neon-purple">$455K</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="text-lg font-bold text-neon-pink">$2.3M</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <Card className="vending-machine p-4 md:p-6">
            <h3 className="font-display text-lg md:text-xl text-neon-pink mb-4">Top Solana Assets</h3>
            <div className="space-y-3">
              {mockSolanaAssets.map((asset, index) => (
                <div key={asset.symbol} className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-neon-cyan/30 hover:border-neon-cyan/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-neon-purple text-black font-bold text-xs">
                      #{index + 1}
                    </Badge>
                    <div className="flex flex-col">
                      <span className="font-bold text-neon-cyan text-sm md:text-base">{asset.symbol}</span>
                      <span className="text-xs text-muted-foreground hidden md:block">{asset.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm md:text-base">${asset.price}</p>
                    <p className={`text-xs ${asset.change.startsWith('+') ? 'text-neon-green' : 'text-red-500'}`}>
                      {asset.change}
                    </p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-sm text-muted-foreground">${asset.marketCap}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="swap" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="holographic p-6">
              <h3 className="font-display text-xl text-neon-green mb-4">🔄 Quick Swap</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neon-cyan mb-2">From (SOL)</label>
                  <input
                    type="number"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full p-3 bg-black border border-neon-cyan/50 rounded-lg text-white focus:border-neon-cyan focus:outline-none"
                  />
                </div>
                <div className="flex justify-center">
                  <Badge className="bg-neon-purple text-black">⇅</Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neon-pink mb-2">To (CCTR)</label>
                  <input
                    type="text"
                    value={swapAmount ? (parseFloat(swapAmount) * 16.39).toFixed(4) : '0.0'}
                    readOnly
                    className="w-full p-3 bg-black/50 border border-neon-pink/50 rounded-lg text-white"
                  />
                </div>
                <Button onClick={handleSwap} className="w-full cyber-button">
                  🚀 SWAP NOW
                </Button>
                <Button 
                  onClick={openJupiterSwap}
                  variant="outline"
                  className="w-full border-neon-green text-neon-green hover:bg-neon-green hover:text-black"
                >
                  🪐 OPEN JUPITER SWAP
                </Button>
              </div>
            </Card>

            <Card className="vending-machine p-6">
              <h3 className="font-display text-xl text-neon-cyan mb-4">💎 Swap Info</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Exchange Rate:</span>
                  <span className="text-neon-green font-bold">1 SOL = 16.39 CCTR</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Fee:</span>
                  <span className="text-neon-cyan">~0.00025 SOL</span>
                </div>
                <div className="flex justify-between">
                  <span>Slippage:</span>
                  <span className="text-neon-purple">0.5%</span>
                </div>
                <div className="flex justify-between">
                  <span>Route:</span>
                  <span className="text-neon-pink text-sm">SOL → USDC → CCTR</span>
                </div>
                <Badge className="w-full bg-neon-green text-black text-center py-2">
                  ⚡ POWERED BY JUPITER AGGREGATOR
                </Badge>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tokenomics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="arcade-frame p-6">
              <h3 className="font-display text-xl text-neon-pink mb-4">📊 CCTR Tokenomics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Supply:</span>
                  <span className="text-neon-green font-bold">100,000,000 CCTR</span>
                </div>
                <div className="flex justify-between">
                  <span>Circulating Supply:</span>
                  <span className="text-neon-cyan font-bold">37,500,000 CCTR</span>
                </div>
                <div className="flex justify-between">
                  <span>Burned Tokens:</span>
                  <span className="text-red-500 font-bold">2,500,000 CCTR</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Price:</span>
                  <span className="text-neon-purple font-bold">$0.061</span>
                </div>
                <div className="flex justify-between">
                  <span>Market Cap:</span>
                  <span className="text-neon-pink font-bold">$2,287,500</span>
                </div>
                <div className="flex justify-between">
                  <span>Fully Diluted:</span>
                  <span className="text-neon-cyan font-bold">$6,100,000</span>
                </div>
              </div>
            </Card>

            <Card className="holographic p-6">
              <h3 className="font-display text-xl text-neon-green mb-4">🎯 Distribution</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Gaming Rewards:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-black rounded-full overflow-hidden">
                      <div className="w-[40%] h-full bg-neon-green"></div>
                    </div>
                    <span className="text-neon-green font-bold">40%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Liquidity Pool:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-black rounded-full overflow-hidden">
                      <div className="w-[25%] h-full bg-neon-cyan"></div>
                    </div>
                    <span className="text-neon-cyan font-bold">25%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Team & Dev:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-black rounded-full overflow-hidden">
                      <div className="w-[15%] h-full bg-neon-purple"></div>
                    </div>
                    <span className="text-neon-purple font-bold">15%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Marketing:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-black rounded-full overflow-hidden">
                      <div className="w-[10%] h-full bg-neon-pink"></div>
                    </div>
                    <span className="text-neon-pink font-bold">10%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Treasury:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-black rounded-full overflow-hidden">
                      <div className="w-[10%] h-full bg-yellow-500"></div>
                    </div>
                    <span className="text-yellow-500 font-bold">10%</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
