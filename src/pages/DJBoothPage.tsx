import React, { useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { DeckControls } from '@/components/dj/DeckControls';
import { useDJEngine } from '@/hooks/useDJEngine';
import { cyberDreamsPlaylist } from '@/data/musicPlaylist';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Disc3, Radio, Mic2, Download, Square } from 'lucide-react';

const DJBoothPage = () => {
  const navigate = useNavigate();
  const dj = useDJEngine();
  const tracks = cyberDreamsPlaylist.tracks;
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);

  const handleStopRecording = async () => {
    const blob = await dj.stopRecording();
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

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 relative z-10 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-neon-cyan hover:bg-neon-cyan/10">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Arcade
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Disc3 className="w-8 h-8 text-neon-cyan animate-spin" style={{ animationDuration: '3s' }} />
            <h1 className="text-3xl sm:text-4xl font-bold text-neon-cyan font-display tracking-wide">
              DJ PRACTICE BOOTH
            </h1>
            <Disc3 className="w-8 h-8 text-neon-pink animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
          </div>
          <p className="text-white/50 text-sm">Mix tracks from the Cyber City Radio library • Web Audio Engine</p>
          <div className="flex justify-center gap-2 mt-3">
            <Badge variant="outline" className="border-neon-cyan/40 text-neon-cyan text-xs">
              <Radio className="w-3 h-3 mr-1" /> {tracks.length} Tracks
            </Badge>
            <Badge variant="outline" className="border-neon-pink/40 text-neon-pink text-xs">
              <Mic2 className="w-3 h-3 mr-1" /> Web Audio API
            </Badge>
          </div>
        </div>

        {/* DJ Console */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-start">
          {/* Deck A */}
          <DeckControls
            label="DECK A"
            deck={dj.deckA}
            color="#00ffff"
            tracks={tracks}
            onLoadTrack={(t) => dj.loadTrack('A', t)}
            onPlayPause={() => dj.playPause('A')}
            onSetCue={() => dj.setCuePoint('A')}
            onJumpToCue={() => dj.jumpToCue('A')}
            onVolumeChange={(v) => dj.setVolume('A', v)}
            onBPMChange={(b) => dj.setBPM('A', b)}
            onFilterChange={(f) => dj.setFilter('A', f)}
            onEchoChange={(e) => dj.setEcho('A', e)}
            onSeek={(t) => dj.seek('A', t)}
          />

          {/* Center Controls */}
          <div className="flex flex-col items-center gap-4 py-4 lg:py-8">
            {/* Sync Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={dj.syncBPM}
              className="border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10 text-xs font-bold tracking-wider"
            >
              SYNC
            </Button>

            {/* Crossfader */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-white/40 uppercase tracking-widest">Crossfader</span>
              <div className="w-48 lg:w-16 lg:h-48 flex lg:flex-col items-center">
                {/* Horizontal on mobile, vertical concept but we'll keep horizontal for simplicity */}
                <span className="text-xs text-neon-cyan font-bold mr-2 lg:mr-0 lg:mb-2">A</span>
                <Slider
                  value={[dj.crossfader]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([v]) => dj.updateCrossfader(v)}
                  className="flex-1"
                />
                <span className="text-xs text-neon-pink font-bold ml-2 lg:ml-0 lg:mt-2">B</span>
              </div>
            </div>

            {/* Record Controls */}
            <div className="flex flex-col items-center gap-2 mt-4">
              {!dj.isRecording ? (
                <Button
                  size="sm"
                  onClick={dj.startRecording}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs"
                >
                  <div className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
                  REC
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleStopRecording}
                  className="bg-red-800 hover:bg-red-900 text-white text-xs animate-pulse"
                >
                  <Square className="w-3 h-3 mr-1" /> STOP
                </Button>
              )}

              {recordingBlob && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadRecording}
                  className="border-neon-green/40 text-neon-green text-xs"
                >
                  <Download className="w-3 h-3 mr-1" /> Download Mix
                </Button>
              )}
            </div>
          </div>

          {/* Deck B */}
          <DeckControls
            label="DECK B"
            deck={dj.deckB}
            color="#ff00ff"
            tracks={tracks}
            onLoadTrack={(t) => dj.loadTrack('B', t)}
            onPlayPause={() => dj.playPause('B')}
            onSetCue={() => dj.setCuePoint('B')}
            onJumpToCue={() => dj.jumpToCue('B')}
            onVolumeChange={(v) => dj.setVolume('B', v)}
            onBPMChange={(b) => dj.setBPM('B', b)}
            onFilterChange={(f) => dj.setFilter('B', f)}
            onEchoChange={(e) => dj.setEcho('B', e)}
            onSeek={(t) => dj.seek('B', t)}
          />
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-neon-cyan mb-2">🎧 DJ Tips</h3>
          <ul className="text-xs text-white/50 space-y-1">
            <li>• Load a track on each deck from the Cyber City Radio library</li>
            <li>• Use the <strong className="text-white/70">BPM</strong> slider to match tempos, or press <strong className="text-white/70">SYNC</strong> to auto-match</li>
            <li>• Slide the <strong className="text-white/70">Crossfader</strong> to blend between decks A ↔ B</li>
            <li>• Set <strong className="text-white/70">CUE</strong> points to mark drop positions, then jump back with the CUE button</li>
            <li>• Apply <strong className="text-white/70">Filter</strong> (low-pass) and <strong className="text-white/70">Echo FX</strong> for transitions</li>
            <li>• Hit <strong className="text-white/70">REC</strong> to record your mix, then download it!</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default DJBoothPage;
