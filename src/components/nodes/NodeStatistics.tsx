
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Server, Coins } from 'lucide-react';

interface NodeType {
  id: string;
  name: string;
  price: number;
  dailyReward: number;
  monthlyReward: number;
  roi: number;
  maxSupply: number;
  currentSupply: number;
  icon: string;
  features: string[];
  description: string;
}

interface NodeStatisticsProps {
  nodeTypes: NodeType[];
}

export const NodeStatistics: React.FC<NodeStatisticsProps> = ({ nodeTypes }) => {
  const totalNodes = nodeTypes.reduce((sum, node) => sum + node.currentSupply, 0);
  const totalRewardsDistributed = 1247.5;
  const averageROI = nodeTypes.reduce((sum, node) => sum + node.roi, 0) / nodeTypes.length;

  // Data for charts
  const nodeDistributionData = nodeTypes.map(node => ({
    name: node.name,
    count: node.currentSupply,
    percentage: ((node.currentSupply / totalNodes) * 100).toFixed(1)
  }));

  const rewardsData = [
    { date: 'Jan 22', rewards: 980 },
    { date: 'Jan 23', rewards: 1050 },
    { date: 'Jan 24', rewards: 1120 },
    { date: 'Jan 25', rewards: 1180 },
    { date: 'Jan 26', rewards: 1220 },
    { date: 'Jan 27', rewards: 1200 },
    { date: 'Jan 28', rewards: 1247 }
  ];

  const COLORS = ['#00ffff', '#ff00ff', '#ffff00'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="holographic">
          <CardContent className="p-4 text-center">
            <Server className="w-6 h-6 text-neon-cyan mx-auto mb-2" />
            <h3 className="text-xs font-semibold text-muted-foreground">TOTAL NODES</h3>
            <p className="text-xl font-bold text-neon-cyan">{totalNodes}</p>
          </CardContent>
        </Card>

        <Card className="holographic">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-neon-purple mx-auto mb-2" />
            <h3 className="text-xs font-semibold text-muted-foreground">NODE HOLDERS</h3>
            <p className="text-xl font-bold text-neon-purple">347</p>
          </CardContent>
        </Card>

        <Card className="holographic">
          <CardContent className="p-4 text-center">
            <Coins className="w-6 h-6 text-neon-green mx-auto mb-2" />
            <h3 className="text-xs font-semibold text-muted-foreground">REWARDS PAID</h3>
            <p className="text-xl font-bold text-neon-green">{totalRewardsDistributed} SOL</p>
          </CardContent>
        </Card>

        <Card className="holographic">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-neon-pink mx-auto mb-2" />
            <h3 className="text-xs font-semibold text-muted-foreground">AVG ROI</h3>
            <p className="text-xl font-bold text-neon-pink">{averageROI.toFixed(0)}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Node Distribution */}
        <Card className="holographic">
          <CardHeader>
            <CardTitle className="text-lg text-neon-cyan">Node Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nodeTypes.map((node, index) => {
                const percentage = (node.currentSupply / totalNodes) * 100;
                return (
                  <div key={node.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{node.icon}</span>
                        {node.name}
                      </span>
                      <span className="font-mono">
                        {node.currentSupply} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Daily Rewards Chart */}
        <Card className="holographic">
          <CardHeader>
            <CardTitle className="text-lg text-neon-purple">Daily Rewards Distributed</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={rewardsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#000', 
                    border: '1px solid #333',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="rewards" fill="#00ffff" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Node Performance Comparison */}
      <Card className="holographic">
        <CardHeader>
          <CardTitle className="text-lg text-neon-pink">Node Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2">Type</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Daily Reward</th>
                  <th className="text-right py-2">Monthly Reward</th>
                  <th className="text-right py-2">ROI</th>
                  <th className="text-right py-2">Supply</th>
                  <th className="text-right py-2">Availability</th>
                </tr>
              </thead>
              <tbody>
                {nodeTypes.map((node) => {
                  const availabilityPercent = ((node.maxSupply - node.currentSupply) / node.maxSupply) * 100;
                  return (
                    <tr key={node.id} className="border-b border-gray-800">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span>{node.icon}</span>
                          <span className={node.id === 'basic' ? 'text-neon-cyan' : 
                                         node.id === 'premium' ? 'text-neon-purple' : 'text-neon-pink'}>
                            {node.name}
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-3 font-mono">{node.price} SOL</td>
                      <td className="text-right py-3 font-mono text-neon-green">{node.dailyReward} SOL</td>
                      <td className="text-right py-3 font-mono text-neon-green">{node.monthlyReward} SOL</td>
                      <td className="text-right py-3 font-mono text-neon-cyan">{node.roi}%</td>
                      <td className="text-right py-3 font-mono">{node.currentSupply}/{node.maxSupply}</td>
                      <td className="text-right py-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          availabilityPercent > 50 ? 'bg-neon-green/20 text-neon-green' :
                          availabilityPercent > 20 ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          {availabilityPercent.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Network Health */}
      <Card className="holographic">
        <CardHeader>
          <CardTitle className="text-lg text-neon-green">Network Health Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Uptime</h4>
              <div className="text-2xl font-bold text-neon-green mb-1">99.7%</div>
              <Progress value={99.7} className="h-2" />
            </div>
            <div className="text-center">
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Transactions/sec</h4>
              <div className="text-2xl font-bold text-neon-cyan mb-1">2,847</div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="text-center">
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Block Time</h4>
              <div className="text-2xl font-bold text-neon-purple mb-1">0.4s</div>
              <Progress value={95} className="h-2" />
            </div>
            <div className="text-center">
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Decentralization</h4>
              <div className="text-2xl font-bold text-neon-pink mb-1">87%</div>
              <Progress value={87} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
