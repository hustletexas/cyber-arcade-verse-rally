import React, { useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProDeckControls } from '@/components/dj/ProDeckControls';
import { ProMixer } from '@/components/dj/ProMixer';
import { DJLibrary } from '@/components/dj/DJLibrary';
import { useDJEnginePro } from '@/hooks/useDJEnginePro';
import { cyberDreamsPlaylist } from '@/data/musicPlaylist';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Disc3, Radio, Mic2, Shield, Users } from 'lucide-react';

const DJBoothPage = () => {
  const navigate = useNavigate();
  const dj = useDJEnginePro();
  const tracks = cyberDreamsPlaylist.tracks;
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);

  const handleStopRecording = async () => {
    const { blob } = await dj.stopRecording();
    setRecordingBlob(blob);
  };

  const handleDownloadRecording = () => {
    if (!recordingBlob) return;
    const url = URL.createObjectURL(recordingBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyber-city-dj-mix-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Galaxy Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{
        background: `
          radial-gradient(ellipse 100% 60% at 50% 0%, rgba(100, 50, 150, 0.4) 0%, transparent 50%),
          radial-gradient(ellipse 80% 50% at 30% 70%, rgba(80, 40, 120, 0.3) 0%, transparent 45%),
          radial-gradient(ellipse 70% 50% at 70% 80%, rgba(60, 30, 100, 0.25) 0%, transparent 40%),
          linear-gradient(180deg, rgb(25, 15, 45) 0%, rgb(20, 12, 40) 30%, rgb(15, 10, 35) 60%, rgb(12, 8, 30) 100%)
        `
      }}>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.9) 1px, transparent 0),
            radial-gradient(1px 1px at 25% 45%, rgba(255,255,255,0.7) 1px, transparent 0),
            radial-gradient(1.5px 1.5px at 35% 15%, rgba(255,200,255,0.8) 1px, transparent 0),
            radial-gradient(1px 1px at 55% 35%, rgba(200,200,255,0.7) 1px, transparent 0),
            radial-gradient(1px 1px at 75% 25%, rgba(255,255,255,0.8) 1px, transparent 0),
            radial-gradient(1px 1px at 85% 55%, rgba(180,180,255,0.7) 1px, transparent 0)
          `,
          backgroundSize: '250px 250px'
        }} />
      </div>

      <TopBar />

      <main className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 relative z-10 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-neon-cyan hover:bg-neon-cyan/10">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </div>

        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-3 mb-1">
            <Disc3 className="w-6 h-6 sm:w-8 sm:h-8 text-neon-cyan animate-spin" style={{ animationDuration: '3s' }} />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neon-cyan font-display tracking-wide">
              CYBER CITY DJ BOOTH
            </h1>
            <Badge className="bg-neon-pink/20 text-neon-pink border-neon-pink/40 text-[10px]">PRO</Badge>
          </div>
          <p className="text-white/50 text-xs">Serato-style mixing • Web Audio Engine • Cyber City Music Only</p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <Badge variant="outline" className="border-neon-cyan/40 text-neon-cyan text-[10px]">
              <Radio className="w-3 h-3 mr-1" /> {tracks.length} Tracks
            </Badge>
            <Badge variant="outline" className="border-neon-pink/40 text-neon-pink text-[10px]">
              <Mic2 className="w-3 h-3 mr-1" /> Web Audio API
            </Badge>
            <Badge variant="outline" className="border-neon-purple/40 text-neon-purple text-[10px]">
              <Shield className="w-3 h-3 mr-1" /> Built on Stellar
            </Badge>
            <Badge variant="outline" className="border-neon-green/40 text-neon-green text-[10px]">
              <Users className="w-3 h-3 mr-1" /> All Ages
            </Badge>
          </div>
        </div>

        {/* Library */}
        <div className="mb-4">
          <DJLibrary tracks={tracks} onLoadToDeck={(deck, track) => dj.loadTrack(deck, track)} />
        </div>

        {/* DJ Console — Desktop: 3-column, Mobile: stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px_1fr] gap-3 items-start">
          {/* Deck A */}
          <ProDeckControls
            label="DECK A"
            deck={dj.deckA}
            deckId="A"
            color="#00ffff"
            onPlayPause={() => dj.playPause('A')}
            onSetCue={() => dj.setCuePoint('A')}
            onJumpToCue={() => dj.jumpToCue('A')}
            onSync={() => dj.syncBPM()}
            onSeek={(t) => dj.seek('A', t)}
            onBPMChange={(b) => dj.setBPM('A', b)}
            onBpmRangeToggle={(r) => dj.setBpmRange('A', r)}
            onTapBPM={() => dj.tapBPM('A')}
            onEQ={(band, val) => dj.setEQ('A', band, val)}
            onGain={(v) => dj.setGain('A', v)}
            onHotCueSet={(i) => dj.setHotCue('A', i)}
            onHotCueJump={(i) => dj.jumpToHotCue('A', i)}
            onHotCueClear={(i) => dj.clearHotCue('A', i)}
            onLoopAuto={(b) => dj.setAutoLoop('A', b)}
            onLoopIn={() => dj.setLoopIn('A')}
            onLoopOut={() => dj.setLoopOut('A')}
            onLoopToggle={() => dj.toggleLoop('A')}
          />

          {/* Center Mixer — sticky on mobile */}
          <div className="lg:sticky lg:top-20 order-first lg:order-none">
            <ProMixer
              deckA={dj.deckA}
              deckB={dj.deckB}
              crossfader={dj.crossfader}
              channelFaderA={dj.channelFaderA}
              channelFaderB={dj.channelFaderB}
              masterVolume={dj.masterVolume}
              masterPeakL={dj.masterPeakL}
              masterPeakR={dj.masterPeakR}
              isRecording={dj.isRecording}
              recordingDuration={dj.recordingDuration}
              onCrossfader={dj.updateCrossfader}
              onChannelFaderA={(v) => dj.updateChannelFader('A', v)}
              onChannelFaderB={(v) => dj.updateChannelFader('B', v)}
              onMasterVolume={dj.updateMasterVolume}
              onFilterA={(f) => dj.setFilter('A', f)}
              onEchoA={(w) => dj.setEcho('A', w)}
              onActiveFxA={(fx) => dj.setActiveFx('A', fx)}
              onFilterB={(f) => dj.setFilter('B', f)}
              onEchoB={(w) => dj.setEcho('B', w)}
              onActiveFxB={(fx) => dj.setActiveFx('B', fx)}
              onStartRecording={dj.startRecording}
              onStopRecording={handleStopRecording}
              onDownloadRecording={handleDownloadRecording}
              hasRecording={!!recordingBlob}
            />
          </div>

          {/* Deck B */}
          <ProDeckControls
            label="DECK B"
            deck={dj.deckB}
            deckId="B"
            color="#ff00ff"
            onPlayPause={() => dj.playPause('B')}
            onSetCue={() => dj.setCuePoint('B')}
            onJumpToCue={() => dj.jumpToCue('B')}
            onSync={() => dj.syncBPM()}
            onSeek={(t) => dj.seek('B', t)}
            onBPMChange={(b) => dj.setBPM('B', b)}
            onBpmRangeToggle={(r) => dj.setBpmRange('B', r)}
            onTapBPM={() => dj.tapBPM('B')}
            onEQ={(band, val) => dj.setEQ('B', band, val)}
            onGain={(v) => dj.setGain('B', v)}
            onHotCueSet={(i) => dj.setHotCue('B', i)}
            onHotCueJump={(i) => dj.jumpToHotCue('B', i)}
            onHotCueClear={(i) => dj.clearHotCue('B', i)}
            onLoopAuto={(b) => dj.setAutoLoop('B', b)}
            onLoopIn={() => dj.setLoopIn('B')}
            onLoopOut={() => dj.setLoopOut('B')}
            onLoopToggle={() => dj.toggleLoop('B')}
          />
        </div>

        {/* Disclaimer & Tips */}
        <div className="mt-6 space-y-3">
          <div className="p-3 rounded-xl border border-neon-cyan/20 bg-black/30 backdrop-blur-sm">
            <p className="text-[10px] text-neon-cyan/70 text-center">
              ⚠️ DJ Booth uses Cyber City-owned music only. All tracks are licensed for in-app mixing.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm">
            <h3 className="text-xs font-bold text-neon-cyan mb-2 font-display">🎧 PRO DJ TIPS</h3>
            <ul className="text-[10px] text-white/50 space-y-0.5 columns-1 sm:columns-2">
              <li>• Load tracks from the library to Deck A or B</li>
              <li>• Use BPM slider or TAP to match tempos, then SYNC</li>
              <li>• Set 8 Hot Cues per track (right-click to clear)</li>
              <li>• Use loop buttons (1/2/4/8/16) for auto-loops</li>
              <li>• Adjust 3-band EQ (HI/MID/LOW) + Gain per deck</li>
              <li>• Select FX (Filter/Echo/Reverb/Flanger) per deck</li>
              <li>• Blend with crossfader and channel faders</li>
              <li>• Hit REC to capture your mix, then download!</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DJBoothPage;
