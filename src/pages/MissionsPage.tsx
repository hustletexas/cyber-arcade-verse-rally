import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { CCCBalanceBar } from '@/components/games/CCCBalanceBar';
import { useMissions, MissionTier, Mission, CreatorSubmission } from '@/hooks/useMissions';
import { useTieredAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, Trophy, Star, Crown, CheckCircle2, Circle, Lock,
  ExternalLink, Upload, Send, Sparkles, Medal, Users, Zap
} from 'lucide-react';

const tierGlow: Record<string, string> = {
  player: 'shadow-[0_0_20px_hsl(190,100%,50%,0.3)]',
  creator: 'shadow-[0_0_20px_hsl(270,100%,60%,0.3)]',
  ambassador: 'shadow-[0_0_20px_hsl(45,100%,50%,0.3)]',
};

const tierBorder: Record<string, string> = {
  player: 'border-[hsl(190,100%,50%,0.4)]',
  creator: 'border-[hsl(270,100%,60%,0.4)]',
  ambassador: 'border-[hsl(45,100%,50%,0.4)]',
};

const tierText: Record<string, string> = {
  player: 'text-[hsl(190,100%,50%)]',
  creator: 'text-[hsl(270,100%,60%)]',
  ambassador: 'text-[hsl(45,100%,50%)]',
};

const tierBg: Record<string, string> = {
  player: 'bg-[hsl(190,100%,50%,0.1)]',
  creator: 'bg-[hsl(270,100%,60%,0.1)]',
  ambassador: 'bg-[hsl(45,100%,50%,0.1)]',
};

const MissionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tier: authTier } = useTieredAuth();
  const {
    playerMissions, creatorMissions, ambassadorMissions,
    playerComplete, creatorComplete, ambassadorComplete,
    claimedRewards, completeMission, claimReward,
    creatorSubmissions, submitCreatorContent,
    ambassadorStatus, applyForAmbassador,
    overallProgress,
  } = useMissions();

  const [activeTier, setActiveTier] = useState<string>('player');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitPlatform, setSubmitPlatform] = useState('');
  const [submitUrl, setSubmitUrl] = useState('');

  const handleClaim = async (tier: MissionTier) => {
    const success = await claimReward(tier);
    if (success) {
      toast({ title: '🎉 Reward Claimed!', description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} tier reward has been claimed.` });
    } else {
      toast({ title: 'Already Claimed', description: 'You have already claimed this reward.', variant: 'destructive' });
    }
  };

  const handleSubmitContent = () => {
    if (!submitUrl) return;
    submitCreatorContent({ platform: submitPlatform || 'Other', url: submitUrl });
    completeMission('c5');
    setShowSubmitModal(false);
    setSubmitUrl('');
    setSubmitPlatform('');
    toast({ title: '📤 Content Submitted', description: 'Your submission is pending review.' });
  };

  const renderMissionCard = (mission: Mission, tierKey: string) => (
    <motion.div
      key={mission.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 p-3 rounded-xl border ${tierBorder[tierKey]} ${tierBg[tierKey]} transition-all`}
    >
      <span className="text-2xl">{mission.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground">{mission.title}</p>
        <p className="text-xs text-muted-foreground truncate">{mission.description}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {mission.status === 'complete' ? (
          <CheckCircle2 className={`w-5 h-5 ${tierText[tierKey]}`} />
        ) : (
          <>
            <Circle className="w-5 h-5 text-muted-foreground" />
            {mission.link && (
              <Button
                size="sm"
                variant="ghost"
                className={`text-xs ${tierText[tierKey]} p-1 h-auto`}
                onClick={() => navigate(mission.link!)}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );

  const renderRewardPreview = (items: string[], tierKey: string) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map((item, i) => (
        <Badge key={i} variant="outline" className={`${tierBorder[tierKey]} ${tierText[tierKey]} text-xs`}>
          {item}
        </Badge>
      ))}
    </div>
  );

  const renderClaimButton = (tier: MissionTier, isComplete: boolean) => {
    const claimed = claimedRewards.includes(tier);
    return (
      <Button
        className={`w-full mt-4 font-display ${claimed ? 'opacity-50' : ''}`}
        disabled={!isComplete || claimed}
        onClick={() => handleClaim(tier)}
      >
        {claimed ? '✅ Reward Claimed' : isComplete ? `🪙 Claim ${tier.charAt(0).toUpperCase() + tier.slice(1)} Reward` : (
          <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> Complete all missions to unlock</span>
        )}
      </Button>
    );
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(220,60%,5%)_0%,hsl(230,50%,10%)_100%)]" />
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'linear-gradient(hsl(180,100%,50%) 1px, transparent 1px), linear-gradient(90deg, hsl(180,100%,50%) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative z-10 px-4 py-10 sm:py-16 max-w-2xl mx-auto text-center">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="absolute top-4 left-4 text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl font-display font-black text-foreground mb-2"
          >
            Arcade Missions
          </motion.h1>
          <p className="text-muted-foreground text-sm sm:text-base mb-4">
            Complete missions. Level up. Earn rewards.
          </p>
          <Badge variant="outline" className="border-accent/50 text-accent mb-4">
            Current Tier: {authTier.charAt(0).toUpperCase() + authTier.slice(1)}
          </Badge>
          <div className="mt-4 max-w-xs mx-auto">
            <p className="text-xs text-muted-foreground mb-1">Overall Completion</p>
            <Progress value={overallProgress} className="h-3" />
            <p className={`text-xs mt-1 text-accent font-bold`}>{overallProgress}%</p>
          </div>
          <div className="flex gap-3 justify-center mt-6">
            <Button onClick={() => { setActiveTier('player'); document.getElementById('missions-tabs')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <Sparkles className="w-4 h-4 mr-1" /> Start Missions
            </Button>
          </div>
        </div>
      </section>

      {/* Wallet Status */}
      <div className="max-w-2xl mx-auto px-4 mt-4">
        <CCCBalanceBar />
      </div>

      {/* Tier Tabs */}
      <section id="missions-tabs" className="max-w-2xl mx-auto px-4 mt-6">
        <Tabs value={activeTier} onValueChange={setActiveTier}>
          <TabsList className="w-full grid grid-cols-3 bg-card/50 border border-border">
            <TabsTrigger value="player" className="font-display text-xs sm:text-sm data-[state=active]:text-[hsl(190,100%,50%)]">
              🥉 Player
            </TabsTrigger>
            <TabsTrigger value="creator" className="font-display text-xs sm:text-sm data-[state=active]:text-[hsl(270,100%,60%)]">
              🎥 Creator
            </TabsTrigger>
            <TabsTrigger value="ambassador" className="font-display text-xs sm:text-sm data-[state=active]:text-[hsl(45,100%,50%)]">
              👑 Ambassador
            </TabsTrigger>
          </TabsList>

          {/* PLAYER TAB */}
          <TabsContent value="player">
            <Card className={`mt-4 ${tierGlow.player} ${tierBorder.player} bg-card/60 backdrop-blur-sm`} style={{ borderRadius: '20px' }}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Medal className={`w-6 h-6 ${tierText.player}`} />
                  <CardTitle className="font-display text-lg">Player Tier</CardTitle>
                </div>
                <CardDescription>Complete onboarding missions to unlock your first reward.</CardDescription>
                {renderRewardPreview(['10 CCC', 'Player Badge', 'Profile Frame'], 'player')}
              </CardHeader>
              <CardContent className="space-y-2">
                {playerMissions.map(m => renderMissionCard(m, 'player'))}
                {renderClaimButton('player', playerComplete)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CREATOR TAB */}
          <TabsContent value="creator">
            <Card className={`mt-4 ${tierGlow.creator} ${tierBorder.creator} bg-card/60 backdrop-blur-sm`} style={{ borderRadius: '20px' }}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Star className={`w-6 h-6 ${tierText.creator}`} />
                  <CardTitle className="font-display text-lg">Creator Tier</CardTitle>
                </div>
                <CardDescription>Create content about Cyber City Arcade and earn exclusive rewards.</CardDescription>
                {renderRewardPreview(['25 CCC', 'Creator NFT Badge', '1 Free Tournament Entry'], 'creator')}
              </CardHeader>
              <CardContent className="space-y-2">
                {creatorMissions.map(m => renderMissionCard(m, 'creator'))}

                {/* Content Submit CTA */}
                <Button
                  variant="outline"
                  className={`w-full mt-3 ${tierBorder.creator} ${tierText.creator}`}
                  onClick={() => setShowSubmitModal(true)}
                >
                  <Upload className="w-4 h-4 mr-2" /> Submit Content Link
                </Button>

                {/* Submissions List */}
                {creatorSubmissions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-muted-foreground font-bold">Your Submissions</p>
                    {creatorSubmissions.map((sub, i) => (
                      <div key={i} className={`flex items-center justify-between p-2 rounded-lg ${tierBg.creator} border ${tierBorder.creator}`}>
                        <div className="text-xs">
                          <span className="font-bold text-foreground">{sub.platform}</span>
                          <span className="text-muted-foreground ml-2 truncate">{sub.url.slice(0, 30)}...</span>
                        </div>
                        <Badge variant="outline" className={
                          sub.status === 'approved' ? 'border-green-500 text-green-400' :
                          sub.status === 'rejected' ? 'border-destructive text-destructive' :
                          'border-yellow-500 text-yellow-400'
                        }>
                          {sub.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {renderClaimButton('creator', creatorComplete)}
                <p className="text-xs text-muted-foreground text-center mt-1">⚠️ Creator rewards require manual approval</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AMBASSADOR TAB */}
          <TabsContent value="ambassador">
            <Card className={`mt-4 ${tierGlow.ambassador} ${tierBorder.ambassador} bg-card/60 backdrop-blur-sm`} style={{ borderRadius: '20px' }}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crown className={`w-6 h-6 ${tierText.ambassador}`} />
                  <CardTitle className="font-display text-lg">Ambassador Tier</CardTitle>
                </div>
                <CardDescription>Elite status for top contributors. Reviewed monthly.</CardDescription>
                {renderRewardPreview(['50 CCC', 'Gold Ambassador NFT', '5% Tournament Boost', 'Homepage Spotlight'], 'ambassador')}
              </CardHeader>
              <CardContent className="space-y-2">
                {ambassadorMissions.map(m => renderMissionCard(m, 'ambassador'))}

                {ambassadorStatus === 'none' && (
                  <Button
                    className={`w-full mt-4 font-display`}
                    disabled={!ambassadorComplete}
                    onClick={applyForAmbassador}
                  >
                    {ambassadorComplete ? (
                      <span className="flex items-center gap-2"><Crown className="w-4 h-4" /> Apply for Ambassador</span>
                    ) : (
                      <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> Complete all missions to apply</span>
                    )}
                  </Button>
                )}
                {ambassadorStatus === 'pending' && (
                  <Badge className="w-full justify-center mt-4 py-2 bg-yellow-500/10 border-yellow-500/40 text-yellow-400">
                    ⏳ Application Pending Admin Review
                  </Badge>
                )}
                {ambassadorStatus === 'approved' && renderClaimButton('ambassador', true)}
                <p className="text-xs text-muted-foreground text-center mt-1">⚠️ Ambassador status requires admin approval</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Mini Leaderboard */}
      <section className="max-w-2xl mx-auto px-4 mt-8 mb-8">
        <Card className="bg-card/60 backdrop-blur-sm border-border" style={{ borderRadius: '20px' }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              <CardTitle className="font-display text-base">Leaderboard</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="players">
              <TabsList className="w-full grid grid-cols-3 bg-muted/30">
                <TabsTrigger value="players" className="text-xs">Top Players</TabsTrigger>
                <TabsTrigger value="creators" className="text-xs">Top Creators</TabsTrigger>
                <TabsTrigger value="referrers" className="text-xs">Top Referrers</TabsTrigger>
              </TabsList>
              {['players', 'creators', 'referrers'].map(tab => (
                <TabsContent key={tab} value={tab}>
                  <div className="space-y-2 mt-2">
                    {[1, 2, 3].map(rank => (
                      <div key={rank} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</span>
                          <span className="text-sm text-muted-foreground">Coming Soon</span>
                        </div>
                        <span className="text-xs text-muted-foreground">---</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </section>

      {/* Content Submission Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowSubmitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl bg-card border ${tierBorder.creator} p-6`}
            >
              <h3 className={`font-display text-lg font-bold ${tierText.creator} mb-4`}>Submit Content</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Platform</label>
                  <select
                    className="w-full rounded-lg bg-input border border-border p-2 text-sm text-foreground"
                    value={submitPlatform}
                    onChange={e => setSubmitPlatform(e.target.value)}
                  >
                    <option value="">Select platform</option>
                    <option value="Twitter/X">Twitter / X</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Content URL</label>
                  <Input
                    placeholder="https://..."
                    value={submitUrl}
                    onChange={e => setSubmitUrl(e.target.value)}
                  />
                </div>
                <label className="flex items-start gap-2 text-xs text-muted-foreground">
                  <input type="checkbox" className="mt-0.5" defaultChecked />
                  I confirm this content is mine and follows community guidelines.
                </label>
                <Button className="w-full" onClick={handleSubmitContent} disabled={!submitUrl}>
                  <Send className="w-4 h-4 mr-2" /> Submit for Review
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MissionsPage;
