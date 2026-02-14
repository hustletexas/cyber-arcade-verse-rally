import { useState, useRef, useCallback, useEffect } from 'react';
import { Track } from '@/types/music';

export interface DeckState {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  bpm: number;
  playbackRate: number;
  isCued: boolean;
  cuePoint: number;
  filterFreq: number;
  echoWet: number;
  waveformData: number[];
}

const defaultDeck: DeckState = {
  track: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  bpm: 120,
  playbackRate: 1,
  isCued: false,
  cuePoint: 0,
  filterFreq: 20000,
  echoWet: 0,
  waveformData: [],
};

export function useDJEngine() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const sourceARef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioARef = useRef<HTMLAudioElement | null>(null);
  const gainARef = useRef<GainNode | null>(null);
  const filterARef = useRef<BiquadFilterNode | null>(null);
  const delayARef = useRef<DelayNode | null>(null);
  const delayGainARef = useRef<GainNode | null>(null);
  const analyserARef = useRef<AnalyserNode | null>(null);

  const sourceBRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioBRef = useRef<HTMLAudioElement | null>(null);
  const gainBRef = useRef<GainNode | null>(null);
  const filterBRef = useRef<BiquadFilterNode | null>(null);
  const delayBRef = useRef<DelayNode | null>(null);
  const delayGainBRef = useRef<GainNode | null>(null);
  const analyserBRef = useRef<AnalyserNode | null>(null);

  const crossfaderGainARef = useRef<GainNode | null>(null);
  const crossfaderGainBRef = useRef<GainNode | null>(null);

  // Track whether Web Audio is connected for each deck
  const webAudioConnectedA = useRef(false);
  const webAudioConnectedB = useRef(false);

  const [deckA, setDeckA] = useState<DeckState>({ ...defaultDeck });
  const [deckB, setDeckB] = useState<DeckState>({ ...defaultDeck });
  const [crossfader, setCrossfader] = useState(0.5);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const animFrameRef = useRef<number>(0);

  const getOrCreateContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      crossfaderGainARef.current = audioContextRef.current.createGain();
      crossfaderGainBRef.current = audioContextRef.current.createGain();
      crossfaderGainARef.current.connect(audioContextRef.current.destination);
      crossfaderGainBRef.current.connect(audioContextRef.current.destination);
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const tryConnectWebAudio = useCallback((deck: 'A' | 'B', audioEl: HTMLAudioElement) => {
    const sourceRef = deck === 'A' ? sourceARef : sourceBRef;
    const gainRef = deck === 'A' ? gainARef : gainBRef;
    const filterRef = deck === 'A' ? filterARef : filterBRef;
    const delayRef = deck === 'A' ? delayARef : delayBRef;
    const delayGainRef = deck === 'A' ? delayGainARef : delayGainBRef;
    const analyserRef = deck === 'A' ? analyserARef : analyserBRef;
    const crossGainRef = deck === 'A' ? crossfaderGainARef : crossfaderGainBRef;
    const connectedRef = deck === 'A' ? webAudioConnectedA : webAudioConnectedB;

    if (connectedRef.current || sourceRef.current) return;

    try {
      const ctx = getOrCreateContext();
      const source = ctx.createMediaElementSource(audioEl);
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 20000;
      const delay = ctx.createDelay(1);
      delay.delayTime.value = 0.3;
      const delayGain = ctx.createGain();
      delayGain.gain.value = 0;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;

      source.connect(gain);
      gain.connect(filter);
      filter.connect(analyser);
      analyser.connect(crossGainRef.current!);

      filter.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(crossGainRef.current!);
      delayGain.connect(delay);

      sourceRef.current = source;
      gainRef.current = gain;
      filterRef.current = filter;
      delayRef.current = delay;
      delayGainRef.current = delayGain;
      analyserRef.current = analyser;
      connectedRef.current = true;
      console.log(`DJ Deck ${deck}: Web Audio connected successfully`);
    } catch (err) {
      console.warn(`DJ Deck ${deck}: Web Audio connection failed, using basic playback`, err);
      connectedRef.current = false;
    }
  }, [getOrCreateContext]);

  const loadTrack = useCallback((deck: 'A' | 'B', track: Track) => {
    const audioRef = deck === 'A' ? audioARef : audioBRef;
    const setDeck = deck === 'A' ? setDeckA : setDeckB;
    const connectedRef = deck === 'A' ? webAudioConnectedA : webAudioConnectedB;

    // Stop current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const updateDeckState = (audio: HTMLAudioElement) => {
      setDeck(prev => ({
        ...prev,
        track,
        duration: audio.duration || 0,
        currentTime: 0,
        isPlaying: false,
        cuePoint: 0,
        isCued: false,
      }));
    };

    // If we already have an audio element and Web Audio is connected, reuse it
    if (audioRef.current && connectedRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.load();
      audioRef.current.addEventListener('loadedmetadata', () => updateDeckState(audioRef.current!), { once: true });
      audioRef.current.addEventListener('error', () => {
        console.error(`DJ Deck ${deck}: Failed to load track "${track.title}"`);
      }, { once: true });
      return;
    }

    // Create new audio element - try with CORS first, fallback without
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    audio.src = track.url;
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      tryConnectWebAudio(deck, audio);
      updateDeckState(audio);
    }, { once: true });

    audio.addEventListener('error', () => {
      console.warn(`DJ Deck ${deck}: CORS load failed for "${track.title}", retrying without CORS...`);
      // Retry without crossOrigin
      const fallbackAudio = new Audio();
      fallbackAudio.preload = 'auto';
      fallbackAudio.src = track.url;
      audioRef.current = fallbackAudio;

      fallbackAudio.addEventListener('loadedmetadata', () => {
        // Don't connect to Web Audio (CORS prevents it), just play directly
        updateDeckState(fallbackAudio);
        console.log(`DJ Deck ${deck}: Track loaded in basic mode (no FX)`);
      }, { once: true });

      fallbackAudio.addEventListener('error', () => {
        console.error(`DJ Deck ${deck}: Track "${track.title}" completely failed to load`);
      }, { once: true });

      fallbackAudio.load();
    }, { once: true });

    audio.load();
  }, [tryConnectWebAudio]);

  const playPause = useCallback((deck: 'A' | 'B') => {
    const audioRef = deck === 'A' ? audioARef : audioBRef;
    const setDeck = deck === 'A' ? setDeckA : setDeckB;
    const audio = audioRef.current;
    if (!audio) return;

    getOrCreateContext();

    if (audio.paused) {
      audio.play().catch(err => console.warn('Play failed:', err));
      setDeck(prev => ({ ...prev, isPlaying: true }));
    } else {
      audio.pause();
      setDeck(prev => ({ ...prev, isPlaying: false }));
    }
  }, [getOrCreateContext]);

  const setCuePoint = useCallback((deck: 'A' | 'B') => {
    const audioRef = deck === 'A' ? audioARef : audioBRef;
    const setDeck = deck === 'A' ? setDeckA : setDeckB;
    if (!audioRef.current) return;
    const t = audioRef.current.currentTime;
    setDeck(prev => ({ ...prev, cuePoint: t, isCued: true }));
  }, []);

  const jumpToCue = useCallback((deck: 'A' | 'B') => {
    const audioRef = deck === 'A' ? audioARef : audioBRef;
    const deckState = deck === 'A' ? deckA : deckB;
    if (!audioRef.current || !deckState.isCued) return;
    audioRef.current.currentTime = deckState.cuePoint;
  }, [deckA, deckB]);

  const setVolume = useCallback((deck: 'A' | 'B', vol: number) => {
    const gainRef = deck === 'A' ? gainARef : gainBRef;
    const audioRef = deck === 'A' ? audioARef : audioBRef;
    const setDeck = deck === 'A' ? setDeckA : setDeckB;
    if (gainRef.current) {
      gainRef.current.gain.value = vol;
    } else if (audioRef.current) {
      // Fallback: control volume directly on the audio element
      audioRef.current.volume = vol;
    }
    setDeck(prev => ({ ...prev, volume: vol }));
  }, []);

  const setBPM = useCallback((deck: 'A' | 'B', bpm: number) => {
    const audioRef = deck === 'A' ? audioARef : audioBRef;
    const setDeck = deck === 'A' ? setDeckA : setDeckB;
    const rate = bpm / 120;
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    setDeck(prev => ({ ...prev, bpm, playbackRate: rate }));
  }, []);

  const syncBPM = useCallback(() => {
    setBPM('B', deckA.bpm);
  }, [deckA.bpm, setBPM]);

  const setFilter = useCallback((deck: 'A' | 'B', freq: number) => {
    const filterRef = deck === 'A' ? filterARef : filterBRef;
    const setDeck = deck === 'A' ? setDeckA : setDeckB;
    if (filterRef.current) {
      filterRef.current.frequency.value = freq;
    }
    setDeck(prev => ({ ...prev, filterFreq: freq }));
  }, []);

  const setEcho = useCallback((deck: 'A' | 'B', wet: number) => {
    const delayGainRef = deck === 'A' ? delayGainARef : delayGainBRef;
    const setDeck = deck === 'A' ? setDeckA : setDeckB;
    if (delayGainRef.current) {
      delayGainRef.current.gain.value = wet * 0.6;
    }
    setDeck(prev => ({ ...prev, echoWet: wet }));
  }, []);

  const updateCrossfader = useCallback((value: number) => {
    setCrossfader(value);
    if (crossfaderGainARef.current) {
      crossfaderGainARef.current.gain.value = Math.cos(value * Math.PI / 2);
    }
    if (crossfaderGainBRef.current) {
      crossfaderGainBRef.current.gain.value = Math.sin(value * Math.PI / 2);
    }
  }, []);

  const seek = useCallback((deck: 'A' | 'B', time: number) => {
    const audioRef = deck === 'A' ? audioARef : audioBRef;
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  // Recording
  const startRecording = useCallback(() => {
    const ctx = getOrCreateContext();
    const dest = ctx.createMediaStreamDestination();
    crossfaderGainARef.current?.connect(dest);
    crossfaderGainBRef.current?.connect(dest);

    const recorder = new MediaRecorder(dest.stream, { mimeType: 'audio/webm' });
    recordedChunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  }, [getOrCreateContext]);

  const stopRecording = useCallback(() => {
    return new Promise<Blob>((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) return;
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        setIsRecording(false);
        resolve(blob);
      };
      recorder.stop();
    });
  }, []);

  // Animation loop
  useEffect(() => {
    const updateLoop = () => {
      if (audioARef.current) {
        setDeckA(prev => ({ ...prev, currentTime: audioARef.current?.currentTime || 0 }));
      }
      if (audioBRef.current) {
        setDeckB(prev => ({ ...prev, currentTime: audioBRef.current?.currentTime || 0 }));
      }

      if (analyserARef.current) {
        const data = new Uint8Array(analyserARef.current.frequencyBinCount);
        analyserARef.current.getByteFrequencyData(data);
        setDeckA(prev => ({ ...prev, waveformData: Array.from(data.slice(0, 64)) }));
      }
      if (analyserBRef.current) {
        const data = new Uint8Array(analyserBRef.current.frequencyBinCount);
        analyserBRef.current.getByteFrequencyData(data);
        setDeckB(prev => ({ ...prev, waveformData: Array.from(data.slice(0, 64)) }));
      }

      animFrameRef.current = requestAnimationFrame(updateLoop);
    };
    animFrameRef.current = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  return {
    deckA,
    deckB,
    crossfader,
    isRecording,
    loadTrack,
    playPause,
    setCuePoint,
    jumpToCue,
    setVolume,
    setBPM,
    syncBPM,
    setFilter,
    setEcho,
    updateCrossfader,
    seek,
    startRecording,
    stopRecording,
  };
}
