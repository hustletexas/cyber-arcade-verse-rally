import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TokenSearch } from '@/components/TokenSearch';

interface DexData {
  time: string;
  price: number;
  volume: number;
}

const initialCCTRData: DexData[] = [
  { time: '00:00', price: 0.25, volume: 2400 },
  { time: '03:00', price: 0.26, volume: 1398 },
  { time: '06:00', price: 0.25, volume: 9800 },
  { time: '09:00', price: 0.27, volume: 3908 },
  { time: '12:00', price: 0.28, volume: 4800 },
  { time: '15:00', price: 0.27, volume: 3800 },
  { time: '18:00', price: 0.29, volume: 4300 },
  { time: '21:00', price: 0.30, volume: 6000 },
];

const generateCCTRData = () => {
  const data = [];
  const now = Date.now();
  const basePrice = 0.25;
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = now - (i * 3600 * 1000); // hourly data points
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const price = basePrice + variation;
    
    data.push({
      time: new Date(timestamp).toISOString(),
      price: Math.max(0.01, price), // minimum price of $0.01
      volume: Math.random() * 10000 + 1000
    });
  }
  
  return data;
};

export const SolanaDexChart = () => {
  const { toast } = useToast();
  const [cctrData, setCCTRData] = useState<DexData[]>(initialCCTRData);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const newData = generateCCTRData();
    setCCTRData(newData);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery) {
      toast({
        title: "Please enter a token symbol or address",
        description: "Enter a valid token to search",
        variant: "destructive"
      });
      return;
    }

    // Simulate searching for tokens
    const results = [
      { id: 'cctr', name: 'Cyber City Token', symbol: 'CCTR', address: 'CCTR123' },
      { id: 'sol', name: 'Solana', symbol: 'SOL', address: 'SOL456' }
    ].filter(token =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(results);

    if (results.length === 0) {
      toast({
        title: "No tokens found",
        description: "Could not find any tokens matching your search query",
        variant: "destructive"
      });
    }
  }, [searchQuery, toast]);

  const handleTokenSelect = (token: any) => {
    toast({
      title: "Token Selected",
      description: `You selected ${token.name} (${token.symbol})`,
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <Card className="vending-machine">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Solana DEX Real-Time Chart
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <TokenSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            handleSearch={handleSearch}
            handleTokenSelect={handleTokenSelect}
          />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cctrData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#82ca9d" />
            <Line type="monotone" dataKey="volume" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex justify-between mt-4">
          <Badge>CCTR Price: ${cctrData[cctrData.length - 1].price.toFixed(2)}</Badge>
          <Badge>Volume: {cctrData[cctrData.length - 1].volume.toFixed(0)}</Badge>
        </div>
      </CardContent>
    </Card>
  );
};
