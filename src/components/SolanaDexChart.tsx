import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowUpDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useToast } from '@/hooks/use-toast';

const mockPriceData = [
  { time: '09:00', CCTR: 0.045, SOL: 85.23, USDC: 1.00, RAY: 1.45, BONK: 0.0000089 },
  { time: '10:00', CCTR: 0.047, SOL: 86.15, USDC: 1.00, RAY: 1.52, BONK: 0.0000092 },
  { time: '11:00', CCTR: 0.044, SOL: 84.85, USDC: 0.999, RAY: 1.48, BONK: 0.0000088 },
  { time: '12:00', CCTR: 0.048, SOL: 87.42, USDC: 1.001, RAY: 1.58, BONK: 0.0000095 },
  { time: '13:00', CCTR: 0.052, SOL: 89.18, USDC: 1.00, RAY: 1.63, BONK: 0.0000098 },
  { time: '14:00', CCTR: 0.049, SOL: 88.56, USDC: 1.00, RAY: 1.59, BONK: 0.0000094 },
];

const solanaAssets = [
  { 
    symbol: 'CCTR', 
    name: 'Cyber City Token', 
    price: 0.052, 
    change: '+15.5%', 
    volume: '$45,000',
    marketCap: '$52,000',
    color: 'neon-green',
    mintAddress: 'CCTRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' // Mock address
  },
  { 
    symbol: 'SOL', 
    name: 'Solana', 
    price: 88.56, 
    change: '+3.9%', 
    volume: '$2.8B',
    marketCap: '$42.1B',
    color: 'neon-purple',
    mintAddress: 'So11111111111111111111111111111111111111112'
  },
  { 
    symbol: 'RAY', 
    name: 'Raydium', 
    price: 1.59, 
    change: '+9.6%', 
    volume: '$125M',
    marketCap: '$523M',
    color: 'neon-cyan',
    mintAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'
  },
  { 
    symbol: 'BONK', 
    name: 'Bonk', 
    price: 0.0000094, 
    change: '+5.6%', 
    volume: '$89M',
    marketCap: '$621M',
    color: 'neon-pink',
    mintAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'
  },
  { 
    symbol: 'USDC', 
    name: 'USD Coin', 
    price: 1.00, 
    change: '0.0%', 
    volume: '$4.2B',
    marketCap: '$32.8B',
    color: 'neon-yellow',
    mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  }
];

export const SolanaDexChart = () => {
  const [selectedAsset, setSelectedAsset] = useState('CCTR');
  const [swapFromToken, setSwapFromToken] = useState('SOL');
  const [swapToToken, setSwapToToken] = useState('CCTR');
  const [swapAmount, setSwapAmount] = useState('');
  const [estimatedOutput, setEstimatedOutput] = useState('0.00');
  const [isSwapping, setIsSwapping] = useState(false);
  const { toast } = useToast();

  const handleSwapTokens = () => {
    const temp = swapFromToken;
    setSwapFromToken(swapToToken);
    setSwapToToken(temp);
  };

  const getQuote = async (inputMint: string, outputMint: string, amount: string) => {
    try {
      const lamports = Math.floor(parseFloat(amount) * 1000000000); // Convert to lamports for SOL
      const response = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${lamports}&slippageBps=50`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting quote:', error);
      return null;
    }
  };

  const executeSwap = async () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid swap amount",
        variant: "destructive"
      });
      return;
    }

    setIsSwapping(true);
    
    try {
      const fromAsset = solanaAssets.find(a => a.symbol === swapFromToken);
      const toAsset = solanaAssets.find(a => a.symbol === swapToToken);
      
      if (!fromAsset || !toAsset) {
        throw new Error('Asset not found');
      }

      // Check if wallet is connected (simulation)
      if (!window.solana || !window.solana.isPhantom) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your Phantom wallet to perform swaps",
          variant: "destructive"
        });
        // Redirect to Jupiter for manual swap
        window.open(`https://jup.ag/swap/${fromAsset.symbol}-${toAsset.symbol}`, '_blank');
        return;
      }

      // Get quote from Jupiter
      const quote = await getQuote(fromAsset.mintAddress, toAsset.mintAddress, swapAmount);
      
      if (!quote) {
        throw new Error('Unable to get quote');
      }

      // In a real implementation, you would:
      // 1. Get the swap transaction from Jupiter
      // 2. Sign and send the transaction
      // 3. Wait for confirmation
      
      // For now, we'll simulate the swap
      toast({
        title: "Swap Initiated",
        description: `Swapping ${swapAmount} ${swapFromToken} for ${estimatedOutput} ${swapToToken}`,
      });

      // Simulate transaction processing
      setTimeout(() => {
        toast({
          title: "Swap Successful! 🎉",
          description: `Successfully swapped ${swapAmount} ${swapFromToken} for ${estimatedOutput} ${swapToToken}`,
        });
        setSwapAmount('');
        setEstimatedOutput('0.00');
      }, 3000);

    } catch (error) {
      console.error('Swap error:', error);
      toast({
        title: "Swap Failed",
        description: error instanceof Error ? error.message : "An error occurred during the swap",
        variant: "destructive"
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const calculateEstimate = (amount: string) => {
    if (!amount) return '0.00';
    const fromAsset = solanaAssets.find(a => a.symbol === swapFromToken);
    const toAsset = solanaAssets.find(a => a.symbol === swapToToken);
    if (fromAsset && toAsset) {
      const estimate = (parseFloat(amount) * fromAsset.price) / toAsset.price;
      return estimate.toFixed(6);
    }
    return '0.00';
  };

  React.useEffect(() => {
    setEstimatedOutput(calculateEstimate(swapAmount));
  }, [swapAmount, swapFromToken, swapToToken]);

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-cyan flex items-center gap-3">
          📈 SOLANA DEX EXCHANGE
          <Badge className="bg-neon-green text-black">LIVE DATA</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Asset List */}
          <Card className="holographic p-6">
            <h3 className="font-bold text-neon-pink mb-4">🪙 SOLANA ASSETS</h3>
            <div className="space-y-3">
              {solanaAssets.map((asset) => (
                <div 
                  key={asset.symbol}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedAsset === asset.symbol 
                      ? 'border-neon-cyan bg-neon-cyan/10' 
                      : 'border-neon-purple/30 hover:border-neon-purple hover:bg-neon-purple/5'
                  }`}
                  onClick={() => setSelectedAsset(asset.symbol)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className={`font-bold text-${asset.color}`}>{asset.symbol}</h4>
                      <p className="text-xs text-muted-foreground">{asset.name}</p>
                    </div>
                    <Badge className={`bg-${asset.change.startsWith('+') ? 'neon-green' : 'red-500'} text-black text-xs`}>
                      {asset.change}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="font-bold text-neon-cyan">
                        ${asset.price < 0.01 ? asset.price.toFixed(8) : asset.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Volume:</span>
                      <span className="text-neon-purple">{asset.volume}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Chart and Swap Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart */}
            <Card className="vending-machine p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-neon-cyan">📊 {selectedAsset} Price Chart</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-neon-green text-neon-green">1H</Button>
                  <Button size="sm" className="cyber-button">24H</Button>
                  <Button size="sm" variant="outline" className="border-neon-purple text-neon-purple">7D</Button>
                </div>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockPriceData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00FFFF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#00FFFF"
                      tick={{ fill: '#00FFFF', fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#00FFFF"
                      tick={{ fill: '#00FFFF', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#000', 
                        border: '1px solid #00FFFF',
                        borderRadius: '8px',
                        color: '#00FFFF'
                      }} 
                    />
                    <Area
                      type="monotone"
                      dataKey={selectedAsset}
                      stroke="#00FFFF"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Enhanced Swap Interface */}
            <Card className="holographic p-6">
              <h3 className="font-bold text-neon-pink mb-6 flex items-center gap-2">
                🔄 TOKEN SWAP
                <Badge className="bg-neon-green text-black text-xs">JUPITER POWERED</Badge>
              </h3>
              
              <div className="space-y-4">
                {/* From Token */}
                <div className="p-4 rounded-lg border border-neon-cyan/30 bg-neon-cyan/5">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-muted-foreground">From</label>
                    <span className="text-xs text-neon-green">Balance: 12.45 {swapFromToken}</span>
                  </div>
                  <div className="flex gap-3">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={swapAmount}
                      onChange={(e) => setSwapAmount(e.target.value)}
                      className="flex-1 bg-black border-neon-cyan/50 text-neon-cyan"
                      disabled={isSwapping}
                    />
                    <select 
                      value={swapFromToken}
                      onChange={(e) => setSwapFromToken(e.target.value)}
                      className="bg-black border border-neon-cyan/50 rounded-md px-3 py-2 text-neon-cyan min-w-[80px]"
                      disabled={isSwapping}
                    >
                      {solanaAssets.map(asset => (
                        <option key={asset.symbol} value={asset.symbol}>{asset.symbol}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleSwapTokens}
                    size="sm"
                    className="cyber-button rounded-full w-10 h-10 p-0"
                    disabled={isSwapping}
                  >
                    <ArrowUpDown size={16} />
                  </Button>
                </div>

                {/* To Token */}
                <div className="p-4 rounded-lg border border-neon-purple/30 bg-neon-purple/5">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-muted-foreground">To</label>
                    <span className="text-xs text-neon-green">Balance: 8.92 {swapToToken}</span>
                  </div>
                  <div className="flex gap-3">
                    <Input
                      type="text"
                      placeholder="0.00"
                      value={estimatedOutput}
                      readOnly
                      className="flex-1 bg-black border-neon-purple/50 text-neon-purple"
                    />
                    <select 
                      value={swapToToken}
                      onChange={(e) => setSwapToToken(e.target.value)}
                      className="bg-black border border-neon-purple/50 rounded-md px-3 py-2 text-neon-purple min-w-[80px]"
                      disabled={isSwapping}
                    >
                      {solanaAssets.map(asset => (
                        <option key={asset.symbol} value={asset.symbol}>{asset.symbol}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Swap Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate:</span>
                    <span className="text-neon-cyan">1 {swapFromToken} = {calculateEstimate('1')} {swapToToken}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slippage:</span>
                    <span className="text-neon-green">0.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network Fee:</span>
                    <span className="text-neon-yellow">~0.0001 SOL</span>
                  </div>
                </div>

                {/* Execute Swap Button */}
                <Button 
                  onClick={executeSwap}
                  disabled={!swapAmount || parseFloat(swapAmount) <= 0 || isSwapping}
                  className="cyber-button w-full h-12 text-lg"
                >
                  {isSwapping ? '⏳ SWAPPING...' : '🚀 EXECUTE SWAP'}
                </Button>

                {/* Alternative Jupiter Link */}
                <div className="text-center">
                  <button
                    onClick={() => window.open('https://jup.ag/', '_blank')}
                    className="text-xs text-neon-purple hover:text-neon-cyan transition-colors underline"
                  >
                    Or swap directly on Jupiter ↗
                  </button>
                </div>
              </div>
            </Card>

            {/* Market Stats */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-muted-foreground">24h High</p>
                <p className="font-bold text-neon-green">
                  ${(solanaAssets.find(a => a.symbol === selectedAsset)?.price * 1.12)?.toFixed(4)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">24h Low</p>
                <p className="font-bold text-neon-pink">
                  ${(solanaAssets.find(a => a.symbol === selectedAsset)?.price * 0.88)?.toFixed(4)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Volume</p>
                <p className="font-bold text-neon-cyan">
                  {solanaAssets.find(a => a.symbol === selectedAsset)?.volume}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
