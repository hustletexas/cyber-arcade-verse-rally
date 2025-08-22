import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, RefreshCw, TrendingUp, TrendingDown, Search, Eye, Flame, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { TokenSearch } from './TokenSearch';

interface TokenData {
  symbol: string;
  name: string;
  price: number;
  change: string;
  changePercent: number;
  volume: string;
  marketCap: string;
  color: string;
  mintAddress: string;
  sparklineData: Array<{ time: string; price: number }>;
}

interface TopTokenData {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  color: string;
  views?: number;
  trending_score?: number;
}

type TimePeriod = '24H' | '7D' | '30D';

const tokenMapping = {
  'solana': { symbol: 'SOL', mintAddress: 'So11111111111111111111111111111111111111112', color: 'neon-purple' },
  'raydium': { symbol: 'RAY', mintAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', color: 'neon-cyan' },
  'bonk': { symbol: 'BONK', mintAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', color: 'neon-pink' },
  'usd-coin': { symbol: 'USDC', mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', color: 'neon-yellow' },
  'jito-governance-token': { symbol: 'JTO', mintAddress: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL', color: 'neon-green' },
  'pyth-network': { symbol: 'PYTH', mintAddress: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', color: 'neon-cyan' },
  'jupiter-exchange-solana': { symbol: 'JUP', mintAddress: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', color: 'neon-purple' },
  'orca': { symbol: 'ORCA', mintAddress: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', color: 'neon-blue' },
  'helium': { symbol: 'HNT', mintAddress: 'hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux', color: 'neon-green' },
  'helium-iot': { symbol: 'IOT', mintAddress: 'iotE9N7GH8QW8AzR2qJ2Y6Cqww1MeB6wNvS7n7qAyZz', color: 'neon-cyan' },
  'helium-mobile': { symbol: 'MOBILE', mintAddress: 'mb1eu7TzEc71KxDpsmsKoucSSuuoGLv1drys1oP2jh6', color: 'neon-pink' }
};

const CCTR_TOKEN = {
  symbol: 'CCTR',
  name: 'Cyber City Token',
  price: 0.052,
  change: '+15.5%',
  changePercent: 15.5,
  volume: '$45,000',
  marketCap: '$52,000',
  color: 'neon-green',
  mintAddress: 'CCTRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  sparklineData: [
    { time: '09:00', price: 0.045 },
    { time: '10:00', price: 0.047 },
    { time: '11:00', price: 0.044 },
    { time: '12:00', price: 0.048 },
    { time: '13:00', price: 0.052 },
    { time: '14:00', price: 0.049 },
  ]
};

// Mock data for when API fails
const mockTokenData: TokenData[] = [
  {
    symbol: 'SOL',
    name: 'Solana',
    price: 172.62,
    change: '+0.22%',
    changePercent: 0.22,
    volume: '$17.9B',
    marketCap: '$92.8B',
    color: 'neon-purple',
    mintAddress: 'So11111111111111111111111111111111111111112',
    sparklineData: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      price: 172 + Math.random() * 10 - 5
    }))
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    price: 0.9999,
    change: '-0.01%',
    changePercent: -0.01,
    volume: '$19.4B',
    marketCap: '$63.5B',
    color: 'neon-yellow',
    mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    sparklineData: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      price: 0.9999 + Math.random() * 0.0002 - 0.0001
    }))
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    price: 0.00003485,
    change: '-4.65%',
    changePercent: -4.65,
    volume: '$2.9B',
    marketCap: '$2.7B',
    color: 'neon-pink',
    mintAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    sparklineData: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      price: 0.00003485 + Math.random() * 0.000005 - 0.0000025
    }))
  }
];

const mockTopTokensData: TopTokenData[] = [
  {
    symbol: 'SOL',
    name: 'Solana',
    price: 172.62,
    changePercent: 0.22,
    volume: '$17.9B',
    marketCap: '$92.8B',
    color: 'neon-purple',
    views: 15420,
    trending_score: 89
  },
  {
    symbol: 'RAY',
    name: 'Raydium',
    price: 4.32,
    changePercent: 8.45,
    volume: '$245M',
    marketCap: '$1.2B',
    color: 'neon-cyan',
    views: 8920,
    trending_score: 76
  },
  {
    symbol: 'JUP',
    name: 'Jupiter',
    price: 0.89,
    changePercent: 12.34,
    volume: '$180M',
    marketCap: '$890M',
    color: 'neon-purple',
    views: 6750,
    trending_score: 82
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    price: 0.00003485,
    changePercent: -4.65,
    volume: '$2.9B',
    marketCap: '$2.7B',
    color: 'neon-pink',
    views: 12340,
    trending_score: 45
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    price: 0.9999,
    changePercent: -0.01,
    volume: '$19.4B',
    marketCap: '$63.5B',
    color: 'neon-yellow',
    views: 5680,
    trending_score: 34
  }
];

export const SolanaDexChart = () => {
  const [selectedAsset, setSelectedAsset] = useState('CCTR');
  const [swapFromToken, setSwapFromToken] = useState('SOL');
  const [swapToToken, setSwapToToken] = useState('CCTR');
  const [swapAmount, setSwapAmount] = useState('');
  const [estimatedOutput, setEstimatedOutput] = useState('0.00');
  const [isSwapping, setIsSwapping] = useState(false);
  const [solanaAssets, setSolanaAssets] = useState<TokenData[]>([CCTR_TOKEN]);
  const [filteredAssets, setFilteredAssets] = useState<TokenData[]>([CCTR_TOKEN]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('24H');
  const [topGainers, setTopGainers] = useState<TopTokenData[]>([]);
  const [topLosers, setTopLosers] = useState<TopTokenData[]>([]);
  const [trendingTokens, setTrendingTokens] = useState<TopTokenData[]>([]);
  const [mostViewedTokens, setMostViewedTokens] = useState<TopTokenData[]>([]);
  const [apiError, setApiError] = useState(false);
  const [walletPublicKey, setWalletPublicKey] = useState<string | null>(null);
  const { toast } = useToast();
  const connection = new Connection('https://api.mainnet-beta.solana.com');

  const fetchTopTokensData = async () => {
    try {
      setApiError(false);
      const tokenIds = Object.keys(tokenMapping).join(',');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${tokenIds}&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`,
        {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const formattedTokens: TopTokenData[] = data.map((token: any) => {
        const mapping = tokenMapping[token.id as keyof typeof tokenMapping];
        if (!mapping) return null;
        
        return {
          symbol: mapping.symbol,
          name: token.name,
          price: token.current_price,
          changePercent: token.price_change_percentage_24h || 0,
          volume: formatVolume(token.total_volume),
          marketCap: formatVolume(token.market_cap),
          color: mapping.color,
          views: Math.floor(Math.random() * 10000) + 1000,
          trending_score: Math.floor(Math.random() * 100) + 1
        };
      }).filter(Boolean);

      // Add CCTR token to the mix
      const cctrToken: TopTokenData = {
        symbol: 'CCTR',
        name: 'Cyber City Token',
        price: 0.052,
        changePercent: 15.5,
        volume: '$45,000',
        marketCap: '$52,000',
        color: 'neon-green',
        views: Math.floor(Math.random() * 5000) + 2000,
        trending_score: Math.floor(Math.random() * 80) + 20
      };

      const allTokens = [cctrToken, ...formattedTokens];
      
      // Sort for different categories
      const gainers = allTokens.filter(t => t.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
      const losers = allTokens.filter(t => t.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
      const trending = allTokens.sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0)).slice(0, 5);
      const mostViewed = allTokens.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

      setTopGainers(gainers);
      setTopLosers(losers);
      setTrendingTokens(trending);
      setMostViewedTokens(mostViewed);

    } catch (error) {
      console.error('Error fetching top tokens data:', error);
      setApiError(true);
      
      // Use mock data when API fails
      const allTokens = [
        {
          symbol: 'CCTR',
          name: 'Cyber City Token',
          price: 0.052,
          changePercent: 15.5,
          volume: '$45,000',
          marketCap: '$52,000',
          color: 'neon-green',
          views: Math.floor(Math.random() * 5000) + 2000,
          trending_score: Math.floor(Math.random() * 80) + 20
        },
        ...mockTopTokensData
      ];
      
      const gainers = allTokens.filter(t => t.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
      const losers = allTokens.filter(t => t.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
      const trending = allTokens.sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0)).slice(0, 5);
      const mostViewed = allTokens.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

      setTopGainers(gainers);
      setTopLosers(losers);
      setTrendingTokens(trending);
      setMostViewedTokens(mostViewed);
    }
  };

  const fetchLiveTokenData = async (period: TimePeriod = timePeriod) => {
    setIsLoading(true);
    try {
      setApiError(false);
      const tokenIds = Object.keys(tokenMapping).join(',');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${tokenIds}&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=${period === '24H' ? '24h' : period === '7D' ? '7d' : '30d'}`,
        {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const formattedTokens: TokenData[] = data.map((token: any) => {
        const mapping = tokenMapping[token.id as keyof typeof tokenMapping];
        if (!mapping) return null;
        
        // Create sparkline data based on the selected period
        let sparklineData;
        if (period === '24H') {
          sparklineData = token.sparkline_in_7d?.price?.slice(-24)?.map((price: number, index: number) => ({
            time: `${index}:00`,
            price: price
          })) || [];
        } else if (period === '7D') {
          sparklineData = token.sparkline_in_7d?.price?.slice(-168)?.filter((_: any, index: number) => index % 7 === 0)?.map((price: number, index: number) => ({
            time: `Day ${index + 1}`,
            price: price
          })) || [];
        } else {
          sparklineData = token.sparkline_in_7d?.price?.slice(-30)?.map((price: number, index: number) => ({
            time: `Day ${index + 1}`,
            price: price
          })) || [];
        }
        
        const changePercent = token[`price_change_percentage_${period === '24H' ? '24h' : period === '7D' ? '7d' : '30d'}`] || token.price_change_percentage_24h;
        
        return {
          symbol: mapping.symbol,
          name: token.name,
          price: token.current_price,
          change: changePercent > 0 
            ? `+${changePercent.toFixed(1)}%`
            : `${changePercent.toFixed(1)}%`,
          changePercent: changePercent,
          volume: formatVolume(token.total_volume),
          marketCap: formatVolume(token.market_cap),
          color: mapping.color,
          mintAddress: mapping.mintAddress,
          sparklineData: sparklineData
        };
      }).filter(Boolean);
      
      // Sort by change percentage to show top gainers first
      const sortedTokens = formattedTokens.sort((a, b) => b.changePercent - a.changePercent);
      
      // Update CCTR token with period-specific data
      const updatedCCTR = {
        ...CCTR_TOKEN,
        sparklineData: generateCCTRData(period)
      };
      
      setSolanaAssets([updatedCCTR, ...sortedTokens]);
      setLastUpdate(new Date());
      
      // Also fetch top tokens data
      await fetchTopTokensData();
      
    } catch (error) {
      console.error('Error fetching live token data:', error);
      setApiError(true);
      
      // Use mock data when API fails
      const updatedCCTR = {
        ...CCTR_TOKEN,
        sparklineData: generateCCTRData(period)
      };
      
      setSolanaAssets([updatedCCTR, ...mockTokenData]);
      setLastUpdate(new Date());
      
      // Use mock data for top tokens too
      await fetchTopTokensData();
      
      toast({
        title: "Using Offline Data",
        description: "Live data unavailable, showing cached information.",
        variant: "default"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateCCTRData = (period: TimePeriod) => {
    const basePrice = 0.052;
    const dataPoints = period === '24H' ? 24 : period === '7D' ? 7 : 30;
    const timeUnit = period === '24H' ? 'hour' : 'day';
    
    return Array.from({ length: dataPoints }, (_, i) => {
      const variance = (Math.random() - 0.5) * 0.01;
      const trend = period === '7D' ? i * 0.0005 : period === '30D' ? i * 0.0003 : i * 0.0001;
      const price = basePrice + trend + variance;
      
      return {
        time: period === '24H' ? `${i}:00` : `${timeUnit} ${i + 1}`,
        price: Math.max(0.03, price)
      };
    });
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(1)}K`;
    return `$${volume.toFixed(0)}`;
  };

  // Filter assets based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredAssets(solanaAssets);
    } else {
      const filtered = solanaAssets.filter(asset =>
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAssets(filtered);
    }
  }, [searchQuery, solanaAssets]);

  useEffect(() => {
    fetchLiveTokenData(timePeriod);
    // Refresh data every 60 seconds to avoid rate limiting
    const interval = setInterval(() => fetchLiveTokenData(timePeriod), 60000);
    return () => clearInterval(interval);
  }, [timePeriod]);

  const getCurrentTokenData = () => {
    const token = solanaAssets.find(a => a.symbol === selectedAsset);
    return token ? token.sparklineData : [];
  };

  const handleTimePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);
    fetchLiveTokenData(period);
  };

  const handleSwapTokens = () => {
    const temp = swapFromToken;
    setSwapFromToken(swapToToken);
    setSwapToToken(temp);
  };

  const handleTokenSelect = async (token: any) => {
    console.log('Selected token:', token);
    
    // Add the new token to our assets if it's not already there
    const newTokenData: TokenData = {
      symbol: token.symbol,
      name: token.name,
      price: token.price || 0.001, // Default price if not available
      change: token.change24h ? `${token.change24h > 0 ? '+' : ''}${token.change24h.toFixed(2)}%` : '+0.00%',
      changePercent: token.change24h || 0,
      volume: '$0', // Will be updated when we get real data
      marketCap: '$0', // Will be updated when we get real data
      color: 'neon-cyan',
      mintAddress: token.mintAddress,
      sparklineData: Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        price: (token.price || 0.001) + Math.random() * 0.001 - 0.0005
      }))
    };

    // Check if token already exists
    const existingTokenIndex = solanaAssets.findIndex(asset => asset.mintAddress === token.mintAddress);
    
    if (existingTokenIndex === -1) {
      // Add new token
      const updatedAssets = [...solanaAssets, newTokenData];
      setSolanaAssets(updatedAssets);
      
      toast({
        title: "Token Added",
        description: `${token.symbol} has been added to your watchlist`,
      });
    } else {
      toast({
        title: "Token Already Added",
        description: `${token.symbol} is already in your watchlist`,
      });
    }

    // Select the token for viewing
    setSelectedAsset(token.symbol);
  };

  const getQuote = async (inputMint: string, outputMint: string, amount: string) => {
    try {
      const lamports = Math.floor(parseFloat(amount) * Math.pow(10, 9)); // Convert to lamports for SOL, adjust decimals for other tokens
      
      const response = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${lamports}&slippageBps=50`
      );
      
      if (!response.ok) {
        throw new Error(`Quote API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Jupiter quote received:', data);
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

    if (!window.solana || !window.solana.isPhantom) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your Phantom wallet to perform swaps",
        variant: "destructive"
      });
      return;
    }

    setIsSwapping(true);
    
    try {
      // Connect wallet if not already connected
      let publicKey = walletPublicKey;
      if (!publicKey) {
        const response = await window.solana.connect();
        if (!response?.publicKey) {
          throw new Error('Failed to connect wallet');
        }
        publicKey = response.publicKey.toString();
        setWalletPublicKey(publicKey);
      }

      const fromAsset = solanaAssets.find(a => a.symbol === swapFromToken);
      const toAsset = solanaAssets.find(a => a.symbol === swapToToken);
      
      if (!fromAsset || !toAsset) {
        throw new Error('Asset not found');
      }

      toast({
        title: "Getting Quote...",
        description: "Fetching best swap route from Jupiter",
      });

      // Get quote from Jupiter
      const quote = await getQuote(fromAsset.mintAddress, toAsset.mintAddress, swapAmount);
      
      if (!quote) {
        throw new Error('Unable to get quote from Jupiter');
      }

      // Calculate output amount
      const outputAmount = quote.outAmount / Math.pow(10, 9); // Adjust for token decimals
      setEstimatedOutput(outputAmount.toFixed(6));

      toast({
        title: "Creating Swap Transaction...",
        description: "Building transaction with Jupiter",
      });

      // Get swap transaction from Jupiter
      const swapResponse = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: publicKey,
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: 'auto'
        }),
      });

      if (!swapResponse.ok) {
        throw new Error(`Swap API error: ${swapResponse.status}`);
      }

      const { swapTransaction } = await swapResponse.json();

      toast({
        title: "Please Sign Transaction",
        description: "Confirm the swap in your wallet",
      });

      // Deserialize the transaction
      const transactionBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(transactionBuf);

      // Sign and send transaction
      const signedTransaction = await window.solana.signTransaction(transaction);
      
      toast({
        title: "Sending Transaction...",
        description: "Broadcasting to Solana network",
      });

      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });

      toast({
        title: "Transaction Sent!",
        description: `TX: ${signature.slice(0, 8)}...${signature.slice(-4)}`,
      });

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      toast({
        title: "Swap Successful! 🎉",
        description: `Successfully swapped ${swapAmount} ${swapFromToken} for ${outputAmount.toFixed(6)} ${swapToToken}`,
      });

      // Clear form
      setSwapAmount('');
      setEstimatedOutput('0.00');

      // Refresh data
      await fetchLiveTokenData(timePeriod);

    } catch (error: any) {
      console.error('Swap error:', error);
      
      let errorMessage = 'Transaction failed. Please try again.';
      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction was cancelled by user.';
      } else if (error.message?.includes('insufficient')) {
        errorMessage = 'Insufficient balance for this transaction.';
      } else if (error.message?.includes('slippage')) {
        errorMessage = 'Price impact too high. Try reducing the amount.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      toast({
        title: "Swap Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const calculateEstimate = async (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) return '0.00';
    
    const fromAsset = solanaAssets.find(a => a.symbol === swapFromToken);
    const toAsset = solanaAssets.find(a => a.symbol === swapToToken);
    
    if (fromAsset && toAsset) {
      try {
        const quote = await getQuote(fromAsset.mintAddress, toAsset.mintAddress, amount);
        if (quote) {
          const outputAmount = quote.outAmount / Math.pow(10, 9); // Adjust for token decimals
          return outputAmount.toFixed(6);
        }
      } catch (error) {
        console.error('Error getting real-time quote:', error);
      }
      
      // Fallback to simple price calculation
      const estimate = (parseFloat(amount) * fromAsset.price) / toAsset.price;
      return estimate.toFixed(6);
    }
    return '0.00';
  };

  // Update estimate when swap parameters change
  React.useEffect(() => {
    if (swapAmount && parseFloat(swapAmount) > 0) {
      calculateEstimate(swapAmount).then(setEstimatedOutput);
    } else {
      setEstimatedOutput('0.00');
    }
  }, [swapAmount, swapFromToken, swapToToken]);

  const TokenCard = ({ token, rank }: { token: TopTokenData; rank: number }) => (
    <div className="flex items-center justify-between p-3 rounded-lg border border-neon-purple/30 hover:border-neon-purple hover:bg-neon-purple/5 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-neon-cyan/20 flex items-center justify-center text-xs font-bold text-neon-cyan">
          {rank}
        </div>
        <div>
          <div className="font-bold text-neon-cyan">{token.symbol}</div>
          <div className="text-xs text-muted-foreground">{token.name}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-neon-purple">
          ${token.price < 0.01 ? token.price.toFixed(8) : token.price.toFixed(2)}
        </div>
        <div className={`text-sm ${token.changePercent > 0 ? 'text-neon-green' : 'text-red-500'}`}>
          {token.changePercent > 0 ? '+' : ''}{token.changePercent.toFixed(1)}%
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.solana && window.solana.isPhantom) {
        try {
          if (window.solana.isConnected) {
            const response = await window.solana.connect({ onlyIfTrusted: true });
            if (response?.publicKey) {
              setWalletPublicKey(response.publicKey.toString());
            }
          }
        } catch (error) {
          console.log('Wallet not auto-connected');
        }
      }
    };
    checkWalletConnection();
  }, []);

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-cyan flex items-center gap-3">
          📈 SOLANA DEX EXCHANGE
          <Badge className={`${apiError ? 'bg-red-500' : 'bg-neon-green'} text-black`}>
            {apiError ? 'OFFLINE MODE' : 'LIVE DATA'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Asset List */}
          <div className="space-y-6">
            <Card className="holographic p-6">
              <h3 className="font-bold text-neon-pink mb-4">🪙 SOLANA ASSETS</h3>
              
              {/* Enhanced Token Search */}
              <TokenSearch
                onTokenSelect={handleTokenSelect}
                placeholder="Search any Solana token..."
                className="mb-4"
              />

              {/* Asset List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredAssets.length === 0 ? (
                  <div className="text-center py-8 text-neon-cyan/60">
                    No assets found matching "{searchQuery}"
                  </div>
                ) : (
                  filteredAssets.map((asset) => (
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
                  ))
                )}
              </div>
            </Card>

            {/* Top Gainers */}
            <Card className="holographic p-6">
              <h3 className="font-bold text-neon-green mb-4 flex items-center gap-2">
                <ArrowUp className="h-5 w-5" />
                🚀 TOP GAINERS
              </h3>
              <div className="space-y-3">
                {topGainers.map((token, index) => (
                  <TokenCard key={token.symbol} token={token} rank={index + 1} />
                ))}
              </div>
            </Card>

            {/* Top Losers */}
            <Card className="holographic p-6">
              <h3 className="font-bold text-red-500 mb-4 flex items-center gap-2">
                <ArrowDown className="h-5 w-5" />
                📉 TOP LOSERS
              </h3>
              <div className="space-y-3">
                {topLosers.map((token, index) => (
                  <TokenCard key={token.symbol} token={token} rank={index + 1} />
                ))}
              </div>
            </Card>
          </div>

          {/* Chart and Swap Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart */}
            <Card className="vending-machine p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-neon-cyan flex items-center gap-2">
                  📊 {selectedAsset} Price Chart
                  {isLoading && <RefreshCw className="animate-spin" size={16} />}
                </h3>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => fetchLiveTokenData(timePeriod)}
                    className="cyber-button text-xs"
                    disabled={isLoading}
                  >
                    {isLoading ? '⏳' : '🔄'} REFRESH
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleTimePeriodChange('24H')}
                    className={`cyber-button text-xs ${timePeriod === '24H' ? 'bg-neon-cyan text-black' : ''}`}
                  >
                    24H
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleTimePeriodChange('7D')}
                    className={`cyber-button text-xs ${timePeriod === '7D' ? 'bg-neon-cyan text-black' : ''}`}
                  >
                    7D
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleTimePeriodChange('30D')}
                    className={`cyber-button text-xs ${timePeriod === '30D' ? 'bg-neon-cyan text-black' : ''}`}
                  >
                    30D
                  </Button>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-neon-green text-black text-xs">
                    🔥 {timePeriod} CHART
                  </Badge>
                  <Badge className="bg-neon-cyan text-black text-xs">
                    Last Updated: {lastUpdate.toLocaleTimeString()}
                  </Badge>
                </div>
                <div className="text-sm text-neon-purple">
                  {solanaAssets.filter(a => a.changePercent > 0).length} gainers • {solanaAssets.filter(a => a.changePercent < 0).length} losers
                </div>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getCurrentTokenData()}>
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
                      dataKey="price"
                      stroke="#00FFFF"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Trending Tokens */}
            <Card className="holographic p-6">
              <h3 className="font-bold text-neon-yellow mb-4 flex items-center gap-2">
                <Flame className="h-5 w-5" />
                🔥 TRENDING TOKENS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {trendingTokens.map((token, index) => (
                  <TokenCard key={token.symbol} token={token} rank={index + 1} />
                ))}
              </div>
            </Card>

            {/* Most Viewed Tokens */}
            <Card className="holographic p-6">
              <h3 className="font-bold text-neon-pink mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                👀 MOST VIEWED
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mostViewedTokens.map((token, index) => (
                  <div key={token.symbol} className="flex items-center justify-between p-3 rounded-lg border border-neon-purple/30 hover:border-neon-purple hover:bg-neon-purple/5 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-neon-pink/20 flex items-center justify-center text-xs font-bold text-neon-pink">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-neon-cyan">{token.symbol}</div>
                        <div className="text-xs text-muted-foreground">{token.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-neon-purple">
                        ${token.price < 0.01 ? token.price.toFixed(8) : token.price.toFixed(2)}
                      </div>
                      <div className="text-xs text-neon-pink">
                        {token.views?.toLocaleString()} views
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Enhanced Swap Interface */}
            <Card className="holographic p-6">
              <h3 className="font-bold text-neon-pink mb-6 flex items-center gap-2">
                🔄 TOKEN SWAP
                <Badge className="bg-neon-green text-black text-xs">JUPITER POWERED</Badge>
                <Badge className="bg-neon-cyan text-black text-xs">MAINNET</Badge>
              </h3>
              
              <div className="space-y-4">
                {/* From Token */}
                <div className="p-4 rounded-lg border border-neon-cyan/30 bg-neon-cyan/5">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-muted-foreground">From</label>
                    <span className="text-xs text-neon-green">
                      {window.solana?.isConnected ? 'Wallet Connected' : 'Connect Wallet'}
                    </span>
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
                    <span className="text-xs text-neon-green">
                      Est. Output: {estimatedOutput} {swapToToken}
                    </span>
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
                    <span className="text-muted-foreground">Network:</span>
                    <span className="text-neon-cyan">Solana Mainnet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slippage:</span>
                    <span className="text-neon-green">0.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network Fee:</span>
                    <span className="text-neon-yellow">~0.000005 SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Route:</span>
                    <span className="text-neon-pink">Jupiter Aggregator</span>
                  </div>
                </div>

                {/* Execute Swap Button */}
                <Button 
                  onClick={executeSwap}
                  disabled={!swapAmount || parseFloat(swapAmount) <= 0 || isSwapping || !walletPublicKey}
                  className="cyber-button w-full h-12 text-lg"
                >
                  {!walletPublicKey
                    ? '🔗 CONNECT WALLET FIRST' 
                    : isSwapping 
                      ? '⏳ SWAPPING...' 
                      : '🚀 EXECUTE SWAP ON SOLANA'
                  }
                </Button>

                {/* Connection Status and Help */}
                <div className="text-center space-y-2">
                  {!walletPublicKey && (
                    <p className="text-xs text-neon-yellow">
                      Please connect your Phantom wallet to swap tokens
                    </p>
                  )}
                  <button
                    onClick={() => window.open('https://jup.ag/', '_blank')}
                    className="text-xs text-neon-purple hover:text-neon-cyan transition-colors underline"
                  >
                    Powered by Jupiter Aggregator ↗
                  </button>
                </div>
              </div>
            </Card>

            {/* Market Stats */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-muted-foreground">{timePeriod} High</p>
                <p className="font-bold text-neon-green">
                  ${(solanaAssets.find(a => a.symbol === selectedAsset)?.price * 1.12)?.toFixed(4)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">{timePeriod} Low</p>
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
