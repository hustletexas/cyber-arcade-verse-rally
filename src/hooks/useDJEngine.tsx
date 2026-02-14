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
  filterFreq: number; // 20-20000 Hz
  echoWet: number; // 0-1
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

  // Deck A refs
  const sourceARef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioARef = useRef<HTMLAudioElement | null>(null);
  const gainARef = useRef<GainNode | null>(null);
  const filterARef = useRef<BiquadFilterNode | null>(null);
  const delayARef = useRef<DelayNode | null>(null);
  const delayGainARef = useRef<GainNode | null>(null);
  const analyserARef = useRef<AnalyserNode | null>(null);

  // Deck B refs
  const sourceBRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioBRef = useRef<HTMLAudioElement | null>(null);
  const gainBRef = useRef<GainNode | null>(null);
  const filterBRef = useRef<BiquadFilterNode | null>(null);
  const delayBRef = useRef<DelayNode | null>(null);
  const delayGainBRef = useRef<GainNode | null>(null);
  const analyserBRef = useRef<AnalyserNode | null>(null);

  // Crossfader
  const crossfaderGainARef = useRef<GainNode | null>(null);
  const crossfaderGainBRef = useRef<GainNode | null>(null);

  const [deckA, setDeckA] = useState<DeckState>({ ...defaultDeck });
  const [deckB, setDeckB] = useState<DeckState>({ ...defaultDeck });
  const [crossfader, setCrossfader] = useState(0.5); // 0=A, 1=B
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const animFrameRef = useRef<number>(0);

  const getOrCreateContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      // Create crossfader gains
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

  const setupDeckAudio = useCallback((
    deck: 'A' | 'B',
    audioEl: HTMLAudioElement
  ) => {
    const ctx = getOrCreateContext();
    const sourceRef = deck === 'A' ? sourceARef : sourceBRef;
    const gainRef = deck === 'A' ? gainARef : gainBRef;
    const filterRef = deck === 'A' ? filterARef : filterBRef;
    const delayRef = deck === 'A' ? delayARef : delayBRef;
    const delayGainRef = deck === 'A' ? delayGainARef : delayGainBRef;
    const analyserRef = deck === 'A' ? analyserARef : analyserBRef;
    const crossGainRef = deck === 'A' ? crossfaderGainARef : crossfaderGainBRef;

    // Don't recreate if already connected to same element
    if (sourceRef.current) return;

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

    // Chain: source -> gain -> filter -> analyser -> crossfader
    source.connect(gain);
    gain.connect(filter);
    filter.connect(analyser);
    analyser.connect(crossGainRef.current!);

    // Echo: filter -> delay -> delayGain -> crossfader
    filter.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(crossGainRef.current!);
    // Feedback loop
    delayGain.connect(delay);

    sourceRef.current = source;
    gainRef.current = gain;
    filterRef.current = filter;
    delayRef.current = delay;
    delayGainRef.current = delayGain;
    analyserRef.current = analyser;
  }, [getOrCreateContext]);

  const loadTrack = useCallback((deck: 'A' | 'B', track: Track) => {
    const audioRef = deck === 'A' ? audioARef : audioBRef;
    const setDeck = deck === 'A' ? setDeckA : setDeckB;

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = 'anonymous';
      audioRef.current.preload = 'auto';
    }

    audioRef.current.src = track.url;
    audioRef.current.load();

    audioRef.current.onloadedmetadata = () => {
      setupDeckAudio(deck, audioRef.current!);
      setDeck(prev => ({
        ...prev,
        track,
        duration: audioRef.current?.duration || 0,
        currentTime: 0,
        isPlaying: false,
        cuePoint: 0,
        isCued: false,
      }));
    };
  }, [setupDeckAudio]);

  const playPause = useCallback((deck: 'A' | 'B') => {
    const audioRef = deck === 'A' ? audioARef : audioBRef;
    const setDeck = deck === 'A' ? setDeckA : setDeckB;
    const audio = audioRef.current;
    if (!audio) return;

    getOrCreateContext();

    if (audio.paused) {
      audio.play();
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
    const setDeck = deck === 'A' ? setDeckA : setDeckB;
    if (gainRef.current) {
      gainRef.current.gain.value = vol;
    }
    setDeck(prev => ({ ...prev, volume: vol }));
  }, []);

  const setBPM = useCallback((deck: 'A' | 'B', bpm: number) => {
    const audioRef = deck === 'A' ? audioARef : audioBRef;
    const setDeck = deck === 'A' ? setDeckA : setDeckB;
    const rate = bpm / 120; // Normalize around 120 BPM
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    setDeck(prev => ({ ...prev, bpm, playbackRate: rate }));
  }, []);

  const syncBPM = useCallback(() => {
    // Sync deck B's BPM to deck A's
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
      delayGainRef.current.gain.value = wet * 0.6; // Cap feedback
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

  // Animation loop to update current time + waveform
  useEffect(() => {
    const updateLoop = () => {
      if (audioARef.current) {
        setDeckA(prev => ({ ...prev, currentTime: audioARef.current?.currentTime || 0 }));
      }
      if (audioBRef.current) {
        setDeckB(prev => ({ ...prev, currentTime: audioBRef.current?.currentTime || 0 }));
      }

      // Waveform data
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
