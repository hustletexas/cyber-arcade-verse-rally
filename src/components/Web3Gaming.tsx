import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FeaturedGames } from './web3games/FeaturedGames';

export const Web3Gaming = () => {
  return (
    <div className="space-y-6">
      <FeaturedGames />
    </div>
  );
};
