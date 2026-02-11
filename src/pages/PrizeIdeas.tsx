import React from 'react';
import { TopBar } from '@/components/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Medal, Sparkles, BookOpen, GraduationCap, AlertTriangle } from 'lucide-react';

const PrizeIdeas = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
            Prize Ideas for Tournament Winners
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            School-friendly, non-monetary reward options that celebrate achievement and keep students motivated.
          </p>
        </div>

        <div className="space-y-8">
          {/* 1. Recognition-Based */}
          <Card className="border-neon-cyan/20 bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Medal className="w-6 h-6 text-neon-cyan" />
                1️⃣ Recognition-Based Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                These are the safest and most school-approved options. <strong className="text-foreground">Recognition {'>'} money in school settings.</strong>
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">🏅 <span>Physical medals or trophies</span></li>
                <li className="flex items-center gap-3">📜 <span>Printed certificates of achievement</span></li>
                <li className="flex items-center gap-3">🧢 <span>Branded Cyber City Arcade merch (shirts, hoodies, hats)</span></li>
                <li className="flex items-center gap-3">🖼 <span>Featured on leaderboard wall (digital recognition)</span></li>
                <li className="flex items-center gap-3">📸 <span>Winner spotlight post (with parent permission)</span></li>
              </ul>
            </CardContent>
          </Card>

          {/* 2. Experience-Based */}
          <Card className="border-neon-magenta/20 bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Sparkles className="w-6 h-6 text-neon-magenta" />
                2️⃣ Experience-Based Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Schools LOVE these because they feel educational. These don't involve money — so they're very safe.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">🎮 <span>Extra play session time</span></li>
                <li className="flex items-center gap-3">🎟 <span>Free entry into next tournament</span></li>
                <li className="flex items-center gap-3">🏆 <span>"Champion Day" badge on profile</span></li>
                <li className="flex items-center gap-3">👑 <span>VIP seating / priority sign-up</span></li>
                <li className="flex items-center gap-3">🧠 <span>Leadership role in next event</span></li>
              </ul>
            </CardContent>
          </Card>

          {/* 3. Educational / Tech */}
          <Card className="border-neon-cyan/20 bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <BookOpen className="w-6 h-6 text-neon-cyan" />
                3️⃣ Educational / Tech Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                These make administrators comfortable. You're giving skill-building tools, not cash.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">🎧 <span>Gaming headset</span></li>
                <li className="flex items-center gap-3">🖱 <span>Gaming mouse</span></li>
                <li className="flex items-center gap-3">⌨️ <span>Keyboard</span></li>
                <li className="flex items-center gap-3">📚 <span>Tech learning book</span></li>
                <li className="flex items-center gap-3">💻 <span>Computer accessory</span></li>
              </ul>
            </CardContent>
          </Card>

          {/* 4. Scholarship / Credit-Based */}
          <Card className="border-neon-magenta/20 bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <GraduationCap className="w-6 h-6 text-neon-magenta" />
                4️⃣ Scholarship / Credit-Based
                <span className="ml-auto text-xs font-normal bg-neon-magenta/10 text-neon-magenta px-3 py-1 rounded-full">
                  Careful Framing
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Instead of "cash prizes," say:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">🎓 <span>Program credit toward future sessions</span></li>
                <li className="flex items-center gap-3">🎮 <span>Event credit</span></li>
                <li className="flex items-center gap-3">🏆 <span>"Season Points" for ranking</span></li>
              </ul>

              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-destructive mb-2">Important:</p>
                    <p className="text-muted-foreground text-sm">
                      If you create an internal points system, make sure:
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                      <li>It cannot be redeemed for cash</li>
                      <li>It cannot be transferred</li>
                      <li>It cannot be traded</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PrizeIdeas;
