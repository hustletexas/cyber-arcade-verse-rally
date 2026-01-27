import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useTournaments } from '@/hooks/useTournaments';
import { 
  TournamentFormat, 
  PayoutSchema, 
  CreateTournamentInput,
  GAME_OPTIONS,
  PASS_TIERS,
  PAYOUT_PERCENTAGES
} from '@/types/tournament';

interface CreateTournamentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateTournamentForm: React.FC<CreateTournamentFormProps> = ({ 
  onSuccess, 
  onCancel 
}) => {
  const { createTournament, loading } = useTournaments();
  
  const [formData, setFormData] = useState<CreateTournamentInput>({
    title: '',
    description: '',
    game: 'tetris',
    format: 'single_elimination',
    max_players: 32,
    min_players: 2,
    start_time: '',
    registration_deadline: '',
    entry_fee_usd: 0,
    prize_pool_usd: 0,
    payout_schema: 'top_3',
    requires_pass: false,
    required_pass_tier: undefined,
    rules: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim()) return;
    if (!formData.start_time) return;

    const result = await createTournament({
      ...formData,
      start_time: new Date(formData.start_time).toISOString(),
      registration_deadline: formData.registration_deadline 
        ? new Date(formData.registration_deadline).toISOString() 
        : undefined
    });

    if (result) {
      onSuccess();
    }
  };

  const updateField = <K extends keyof CreateTournamentInput>(
    field: K, 
    value: CreateTournamentInput[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="arcade-frame">
      <CardHeader className="flex flex-row items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-neon-pink" />
          <CardTitle className="font-display text-neon-pink">Create Tournament</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Tournament Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => updateField('title', e.target.value)}
                placeholder="e.g., Weekend Showdown"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="game">Game *</Label>
              <Select value={formData.game} onValueChange={v => updateField('game', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {GAME_OPTIONS.map(game => (
                    <SelectItem key={game.value} value={game.value}>
                      {game.icon} {game.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => updateField('description', e.target.value)}
              placeholder="Describe your tournament..."
              rows={3}
            />
          </div>

          {/* Format & Players */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Format</Label>
              <Select 
                value={formData.format} 
                onValueChange={v => updateField('format', v as TournamentFormat)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="single_elimination">Single Elimination</SelectItem>
                  <SelectItem value="double_elimination">Double Elimination</SelectItem>
                  <SelectItem value="round_robin">Round Robin</SelectItem>
                  <SelectItem value="swiss">Swiss</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_players">Max Players</Label>
              <Select 
                value={formData.max_players.toString()} 
                onValueChange={v => updateField('max_players', parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {[4, 8, 16, 32, 64, 128].map(n => (
                    <SelectItem key={n} value={n.toString()}>{n} Players</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_players">Min Players</Label>
              <Input
                id="min_players"
                type="number"
                min={2}
                max={formData.max_players}
                value={formData.min_players}
                onChange={e => updateField('min_players', parseInt(e.target.value) || 2)}
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={e => updateField('start_time', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration_deadline">Registration Deadline</Label>
              <Input
                id="registration_deadline"
                type="datetime-local"
                value={formData.registration_deadline}
                onChange={e => updateField('registration_deadline', e.target.value)}
              />
            </div>
          </div>

          {/* Entry & Prize */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="entry_fee">Entry Fee (USD)</Label>
              <Input
                id="entry_fee"
                type="number"
                min={0}
                step={0.01}
                value={formData.entry_fee_usd}
                onChange={e => updateField('entry_fee_usd', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prize_pool">Prize Pool (USD)</Label>
              <Input
                id="prize_pool"
                type="number"
                min={0}
                step={0.01}
                value={formData.prize_pool_usd}
                onChange={e => updateField('prize_pool_usd', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Payout Schema</Label>
              <Select 
                value={formData.payout_schema} 
                onValueChange={v => updateField('payout_schema', v as PayoutSchema)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="winner_takes_all">Winner Takes All</SelectItem>
                  <SelectItem value="top_3">Top 3 (50/30/20)</SelectItem>
                  <SelectItem value="top_5">Top 5</SelectItem>
                  <SelectItem value="top_10">Top 10</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payout Preview */}
          {formData.prize_pool_usd > 0 && (
            <div className="p-4 bg-neon-green/10 rounded-lg border border-neon-green/30">
              <p className="text-sm font-medium mb-2">Payout Distribution:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PAYOUT_PERCENTAGES[formData.payout_schema]).map(([place, percent]) => (
                  <span key={place} className="text-sm">
                    {place === '1' ? '🥇' : place === '2' ? '🥈' : place === '3' ? '🥉' : `#${place}`}
                    {' '}{percent}% (${((formData.prize_pool_usd || 0) * percent / 100).toFixed(2)})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pass Requirement */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Require NFT Pass</Label>
                <p className="text-sm text-muted-foreground">Gate entry with Cyber City Pass</p>
              </div>
              <Switch
                checked={formData.requires_pass}
                onCheckedChange={v => updateField('requires_pass', v)}
              />
            </div>
            
            {formData.requires_pass && (
              <div className="space-y-2">
                <Label>Required Pass Tier</Label>
                <Select 
                  value={formData.required_pass_tier || ''} 
                  onValueChange={v => updateField('required_pass_tier', v || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any tier" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="">Any Tier</SelectItem>
                    {PASS_TIERS.map(tier => (
                      <SelectItem key={tier.value} value={tier.value}>
                        {tier.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Rules */}
          <div className="space-y-2">
            <Label htmlFor="rules">Tournament Rules</Label>
            <Textarea
              id="rules"
              value={formData.rules}
              onChange={e => updateField('rules', e.target.value)}
              placeholder="Enter tournament rules and guidelines..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="cyber-button" disabled={loading}>
              {loading ? 'Creating...' : 'Create Tournament'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
