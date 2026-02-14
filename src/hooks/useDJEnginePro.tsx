import { useState, useRef, useCallback, useEffect } from 'react';
import { Track } from '@/types/music';

export interface ProDeckState {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  bpm: number;
  originalBpm: number;
  playbackRate: number;
  isCued: boolean;
  cuePoint: number;
  // 3-band EQ
  eqHi: number;
  eqMid: number;
  eqLow: number;
  gain: number;
  // FX
  filterFreq: number;
  echoWet: number;
  reverbWet: number;
  flangerWet: number;
  activeFx: 'filter' | 'echo' | 'reverb' | 'flanger' | null;
  // Hot cues
  hotCues: (number | null)[];
  // Loop
  loopIn: number | null;
  loopOut: number | null;
  isLooping: boolean;
  loopLength: number | null;
  // Waveform
  waveformData: number[];
  peakLevel: number;
  // BPM range
  bpmRange: 8 | 16;
}

const defaultProDeck: ProDeckState = {
  track: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  bpm: 120,
  originalBpm: 120,
  playbackRate: 1,
  isCued: false,
  cuePoint: 0,
  eqHi: 0,
  eqMid: 0,
  eqLow: 0,
  gain: 1,
  filterFreq: 20000,
  echoWet: 0,
  reverbWet: 0,
  flangerWet: 0,
  activeFx: null,
  hotCues: Array(8).fill(null),
  loopIn: null,
  loopOut: null,
  isLooping: false,
  loopLength: null,
  waveformData: [],
  peakLevel: 0,
  bpmRange: 8,
};

export function useDJEnginePro() {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Deck A refs
  const audioARef = useRef<HTMLAudioElement | null>(null);
  const sourceARef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainARef = useRef<GainNode | null>(null);
  const eqHiARef = useRef<BiquadFilterNode | null>(null);
  const eqMidARef = useRef<BiquadFilterNode | null>(null);
  const eqLowARef = useRef<BiquadFilterNode | null>(null);
  const masterGainARef = useRef<GainNode | null>(null);
  const filterARef = useRef<BiquadFilterNode | null>(null);
  const delayARef = useRef<DelayNode | null>(null);
  const delayGainARef = useRef<GainNode | null>(null);
  const analyserARef = useRef<AnalyserNode | null>(null);
  const connectedA = useRef(false);

  // Deck B refs
  const audioBRef = useRef<HTMLAudioElement | null>(null);
  const sourceBRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainBRef = useRef<GainNode | null>(null);
  const eqHiBRef = useRef<BiquadFilterNode | null>(null);
  const eqMidBRef = useRef<BiquadFilterNode | null>(null);
  const eqLowBRef = useRef<BiquadFilterNode | null>(null);
  const masterGainBRef = useRef<GainNode | null>(null);
  const filterBRef = useRef<BiquadFilterNode | null>(null);
  const delayBRef = useRef<DelayNode | null>(null);
  const delayGainBRef = useRef<GainNode | null>(null);
  const analyserBRef = useRef<AnalyserNode | null>(null);
  const connectedB = useRef(false);

  // Mixer refs
  const crossfaderGainARef = useRef<GainNode | null>(null);
  const crossfaderGainBRef = useRef<GainNode | null>(null);
  const channelFaderARef = useRef<GainNode | null>(null);
  const channelFaderBRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const masterAnalyserRef = useRef<AnalyserNode | null>(null);

  const [deckA, setDeckA] = useState<ProDeckState>({ ...defaultProDeck });
  const [deckB, setDeckB] = useState<ProDeckState>({ ...defaultProDeck });
  const [crossfader, setCrossfader] = useState(0.5);
  const [channelFaderA, setChannelFaderA] = useState(0.8);
  const [channelFaderB, setChannelFaderB] = useState(0.8);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [masterPeakL, setMasterPeakL] = useState(0);
  const [masterPeakR, setMasterPeakR] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingStartRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);

  const getOrCreateContext = useCallback(() => {
    if (!audioContextRef.current) {
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      
      // Create mixer chain
      crossfaderGainARef.current = ctx.createGain();
      crossfaderGainBRef.current = ctx.createGain();
      channelFaderARef.current = ctx.createGain();
      channelFaderBRef.current = ctx.createGain();
      masterGainRef.current = ctx.createGain();
      masterAnalyserRef.current = ctx.createAnalyser();
      masterAnalyserRef.current.fftSize = 256;
      
      channelFaderARef.current.connect(crossfaderGainARef.current);
      channelFaderBRef.current.connect(crossfaderGainBRef.current);
      crossfaderGainARef.current.connect(masterGainRef.current);
      crossfaderGainBRef.current.connect(masterGainRef.current);
      masterGainRef.current.connect(masterAnalyserRef.current);
      masterAnalyserRef.current.connect(ctx.destination);
      
      masterGainRef.current.gain.value = 0.8;
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const connectWebAudio = useCallback((deck: 'A' | 'B', audioEl: HTMLAudioElement) => {
    const refs = deck === 'A'
      ? { source: sourceARef, gain: gainARef, eqHi: eqHiARef, eqMid: eqMidARef, eqLow: eqLowARef, masterGain: masterGainARef, filter: filterARef, delay: delayARef, delayGain: delayGainARef, analyser: analyserARef, connected: connectedA, channelFader: channelFaderARef }
      : { source: sourceBRef, gain: gainBRef, eqHi: eqHiBRef, eqMid: eqMidBRef, eqLow: eqLowBRef, masterGain: masterGainBRef, filter: filterBRef, delay: delayBRef, delayGain: delayGainBRef, analyser: analyserBRef, connected: connectedB, channelFader: channelFaderBRef };

    if (refs.connected.current || refs.source.current) return;

    try {
      const ctx = getOrCreateContext();
      const source = ctx.createMediaElementSource(audioEl);
      const gain = ctx.createGain();
      
      // 3-band EQ
      const eqHi = ctx.createBiquadFilter();
      eqHi.type = 'highshelf';
      eqHi.frequency.value = 3200;
      eqHi.gain.value = 0;
      
      const eqMid = ctx.createBiquadFilter();
      eqMid.type = 'peaking';
      eqMid.frequency.value = 1000;
      eqMid.Q.value = 0.7;
      eqMid.gain.value = 0;
      
      const eqLow = ctx.createBiquadFilter();
      eqLow.type = 'lowshelf';
      eqLow.frequency.value = 320;
      eqLow.gain.value = 0;
      
      const masterG = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 20000;
      
      const delay = ctx.createDelay(1);
      delay.delayTime.value = 0.3;
      const delayGain = ctx.createGain();
      delayGain.gain.value = 0;
      
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;

      // Chain: source → gain → eqLow → eqMid → eqHi → masterGain → filter → analyser → channelFader
      source.connect(gain);
      gain.connect(eqLow);
      eqLow.connect(eqMid);
      eqMid.connect(eqHi);
      eqHi.connect(masterG);
      masterG.connect(filter);
      filter.connect(analyser);
      analyser.connect(refs.channelFader.current!);

      // Echo FX (parallel)
      filter.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(refs.channelFader.current!);
      delayGain.connect(delay);

      refs.source.current = source;
      refs.gain.current = gain;
      refs.eqHi.current = eqHi;
      refs.eqMid.current = eqMid;
      refs.eqLow.current = eqLow;
      refs.masterGain.current = masterG;
      refs.filter.current = filter;
      refs.delay.current = delay;
      refs.delayGain.current = delayGain;
      refs.analyser.current = analyser;
      refs.connected.current = true;
      console.log(`DJ Pro Deck ${deck}: Web Audio connected`);
    } catch (err) {
      console.warn(`DJ Pro Deck ${deck}: Web Audio connection failed`, err);
    }
  }, [getOrCreateContext]);

  const loadTrack = useCallback((deck: 'A' | 'B', track: Track) => {
    const audioRef = deck === 'A' ? audioARef : audioBRef;
    const setDeck = deck === 'A' ? setDeckA : setDeckB;
    const connRef = deck === 'A' ? connectedA : connectedB;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const updateState = (audio: HTMLAudioElement) => {
      setDeck(prev => ({
        ...prev,
        track,
        duration: audio.duration || 0,
        currentTime: 0,
        isPlaying: false,
        cuePoint: 0,
        isCued: false,
        hotCues: Array(8).fill(null),
        loopIn: null,
        loopOut: null,
        isLooping: false,
      }));
    };

    if (audioRef.current && connRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.load();
      audioRef.current.addEventListener('loadedmetadata', () => updateState(audioRef.current!), { once: true });
      return;
    }

    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    audio.src = track.url;
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      connectWebAudio(deck, audio);
      updateState(audio);
    }, { once: true });

    audio.addEventListener('error', () => {
      console.warn(`DJ Pro Deck ${deck}: CORS failed, retrying...`);
      const fb = new Audio();
      fb.preload = 'auto';
      fb.src = track.url;
      audioRef.current = fb;
      fb.addEventListener('loadedmetadata', () => updateState(fb), { once: true });
      fb.load();
    }, { once: true });

    audio.load();
  }, [connectWebAudio]);

  const playPause = useCallback((deck: 'A' | 'B') => {
    const audio = (deck === 'A' ? audioARef : audioBRef).current;
    const setDeck = deck === 'A' ? setDeckA : setDeckB;
    if (!audio) return;
    getOrCreateContext();
    if (audio.paused) {
      audio.play().catch(() => {});
      setDeck(prev => ({ ...prev, isPlaying: true }));
    } else {
      audio.pause();
      setDeck(prev => ({ ...prev, isPlaying: false }));
    }
  }, [getOrCreateContext]);

  const setCuePoint = useCallback((deck: 'A' | 'B') => {
    const audio = (deck === 'A' ? audioARef : audioBRef).current;
    const setDeck = deck === 'A' ? setDeckA : setDeckB;
    if (!audio) return;
    setDeck(prev => ({ ...prev, cuePoint: audio.currentTime, isCued: true }));
  }, []);

  const jumpToCue = useCallback((deck: 'A' | 'B') => {
    const audio = (deck === 'A' ? audioARef : audioBRef).current;
    const deckState = deck === 'A' ? deckA : deckB;
    if (!audio || !deckState.isCued) return;
    audio.currentTime = deckState.cuePoint;
  }, [deckA, deckB]);

  const setVolume = useCallback((deck: 'A' | 'B', vol: number) => {
    const gainRef = deck === 'A' ? gainARef : gainBRef;
    const audio = (deck === 'A' ? audioARef : audioBRef).current;
    if (gainRef.current) gainRef.current.gain.value = vol;
    else if (audio) audio.volume = vol;
    (deck === 'A' ? setDeckA : setDeckB)(prev => ({ ...prev, volume: vol }));
  }, []);

  const setBPM = useCallback((deck: 'A' | 'B', bpm: number) => {
    const audio = (deck === 'A' ? audioARef : audioBRef).current;
    const setDeck = deck === 'A' ? setDeckA : setDeckB;
    const rate = bpm / (deck === 'A' ? deckA : deckB).originalBpm;
    if (audio) audio.playbackRate = rate;
    setDeck(prev => ({ ...prev, bpm, playbackRate: rate }));
  }, [deckA.originalBpm, deckB.originalBpm]);

  const syncBPM = useCallback(() => {
    setBPM('B', deckA.bpm);
  }, [deckA.bpm, setBPM]);

  const setEQ = useCallback((deck: 'A' | 'B', band: 'hi' | 'mid' | 'low', value: number) => {
    const refs = deck === 'A'
      ? { hi: eqHiARef, mid: eqMidARef, low: eqLowARef }
      : { hi: eqHiBRef, mid: eqMidBRef, low: eqLowBRef };
    const node = refs[band].current;
    if (node) node.gain.value = value;
    const setDeck = deck === 'A' ? setDeckA : setDeckB;
    setDeck(prev => ({
      ...prev,
      ...(band === 'hi' ? { eqHi: value } : band === 'mid' ? { eqMid: value } : { eqLow: value }),
    }));
  }, []);

  const setGain = useCallback((deck: 'A' | 'B', value: number) => {
    const ref = deck === 'A' ? masterGainARef : masterGainBRef;
    if (ref.current) ref.current.gain.value = value;
    (deck === 'A' ? setDeckA : setDeckB)(prev => ({ ...prev, gain: value }));
  }, []);

  const setFilter = useCallback((deck: 'A' | 'B', freq: number) => {
    const ref = deck === 'A' ? filterARef : filterBRef;
    if (ref.current) ref.current.frequency.value = freq;
    (deck === 'A' ? setDeckA : setDeckB)(prev => ({ ...prev, filterFreq: freq }));
  }, []);

  const setEcho = useCallback((deck: 'A' | 'B', wet: number) => {
    const ref = deck === 'A' ? delayGainARef : delayGainBRef;
    if (ref.current) ref.current.gain.value = wet * 0.6;
    (deck === 'A' ? setDeckA : setDeckB)(prev => ({ ...prev, echoWet: wet }));
  }, []);

  const setActiveFx = useCallback((deck: 'A' | 'B', fx: ProDeckState['activeFx']) => {
    (deck === 'A' ? setDeckA : setDeckB)(prev => ({ ...prev, activeFx: fx }));
  }, []);

  const updateCrossfader = useCallback((value: number) => {
    setCrossfader(value);
    if (crossfaderGainARef.current) crossfaderGainARef.current.gain.value = Math.cos(value * Math.PI / 2);
    if (crossfaderGainBRef.current) crossfaderGainBRef.current.gain.value = Math.sin(value * Math.PI / 2);
  }, []);

  const updateChannelFader = useCallback((deck: 'A' | 'B', value: number) => {
    const ref = deck === 'A' ? channelFaderARef : channelFaderBRef;
    if (ref.current) ref.current.gain.value = value;
    (deck === 'A' ? setChannelFaderA : setChannelFaderB)(value);
  }, []);

  const updateMasterVolume = useCallback((value: number) => {
    if (masterGainRef.current) masterGainRef.current.gain.value = value;
    setMasterVolume(value);
  }, []);

  const seek = useCallback((deck: 'A' | 'B', time: number) => {
    const audio = (deck === 'A' ? audioARef : audioBRef).current;
    if (audio) audio.currentTime = time;
  }, []);

  // Hot cues
  const setHotCue = useCallback((deck: 'A' | 'B', index: number) => {
    const audio = (deck === 'A' ? audioARef : audioBRef).current;
    if (!audio) return;
    const setDeck = deck === 'A' ? setDeckA : setDeckB;
    setDeck(prev => {
      const cues = [...prev.hotCues];
      cues[index] = audio.currentTime;
      return { ...prev, hotCues: cues };
    });
  }, []);

  const jumpToHotCue = useCallback((deck: 'A' | 'B', index: number) => {
    const audio = (deck === 'A' ? audioARef : audioBRef).current;
    const deckState = deck === 'A' ? deckA : deckB;
    if (!audio || deckState.hotCues[index] === null) return;
    audio.currentTime = deckState.hotCues[index]!;
    if (audio.paused) {
      audio.play().catch(() => {});
      (deck === 'A' ? setDeckA : setDeckB)(prev => ({ ...prev, isPlaying: true }));
    }
  }, [deckA, deckB]);

  const clearHotCue = useCallback((deck: 'A' | 'B', index: number) => {
    (deck === 'A' ? setDeckA : setDeckB)(prev => {
      const cues = [...prev.hotCues];
      cues[index] = null;
      return { ...prev, hotCues: cues };
    });
  }, []);

  // Loop controls
  const setLoopIn = useCallback((deck: 'A' | 'B') => {
    const audio = (deck === 'A' ? audioARef : audioBRef).current;
    if (!audio) return;
    (deck === 'A' ? setDeckA : setDeckB)(prev => ({ ...prev, loopIn: audio.currentTime }));
  }, []);

  const setLoopOut = useCallback((deck: 'A' | 'B') => {
    const audio = (deck === 'A' ? audioARef : audioBRef).current;
    if (!audio) return;
    (deck === 'A' ? setDeckA : setDeckB)(prev => ({ ...prev, loopOut: audio.currentTime, isLooping: true }));
  }, []);

  const setAutoLoop = useCallback((deck: 'A' | 'B', beats: number) => {
    const audio = (deck === 'A' ? audioARef : audioBRef).current;
    const deckState = deck === 'A' ? deckA : deckB;
    if (!audio) return;
    const beatDuration = 60 / deckState.bpm;
    const loopDuration = beatDuration * beats;
    const loopStart = audio.currentTime;
    (deck === 'A' ? setDeckA : setDeckB)(prev => ({
      ...prev,
      loopIn: loopStart,
      loopOut: loopStart + loopDuration,
      isLooping: true,
      loopLength: beats,
    }));
  }, [deckA.bpm, deckB.bpm]);

  const toggleLoop = useCallback((deck: 'A' | 'B') => {
    (deck === 'A' ? setDeckA : setDeckB)(prev => ({
      ...prev,
      isLooping: !prev.isLooping,
      ...(prev.isLooping ? { loopIn: null, loopOut: null, loopLength: null } : {}),
    }));
  }, []);

  const setBpmRange = useCallback((deck: 'A' | 'B', range: 8 | 16) => {
    (deck === 'A' ? setDeckA : setDeckB)(prev => ({ ...prev, bpmRange: range }));
  }, []);

  const tapBPM = useCallback((deck: 'A' | 'B') => {
    const now = Date.now();
    const tapTimesRef = deck === 'A' ? tapTimesARef : tapTimesBRef;
    tapTimesRef.current.push(now);
    if (tapTimesRef.current.length > 8) tapTimesRef.current.shift();
    if (tapTimesRef.current.length >= 2) {
      const intervals = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      }
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const bpm = Math.round(60000 / avg);
      if (bpm > 40 && bpm < 300) {
        (deck === 'A' ? setDeckA : setDeckB)(prev => ({ ...prev, bpm, originalBpm: bpm }));
      }
    }
  }, []);

  const tapTimesARef = useRef<number[]>([]);
  const tapTimesBRef = useRef<number[]>([]);

  // Recording
  const startRecording = useCallback(() => {
    const ctx = getOrCreateContext();
    const dest = ctx.createMediaStreamDestination();
    masterGainRef.current?.connect(dest);
    const recorder = new MediaRecorder(dest.stream, { mimeType: 'audio/webm' });
    recordedChunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    recordingStartRef.current = Date.now();
    setIsRecording(true);
  }, [getOrCreateContext]);

  const stopRecording = useCallback(() => {
    return new Promise<{ blob: Blob; duration: number }>((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) return;
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const duration = Math.round((Date.now() - recordingStartRef.current) / 1000);
        setIsRecording(false);
        setRecordingDuration(0);
        resolve({ blob, duration });
      };
      recorder.stop();
    });
  }, []);

  // Animation loop
  useEffect(() => {
    const updateLoop = () => {
      // Update deck times
      if (audioARef.current) {
        const t = audioARef.current.currentTime;
        setDeckA(prev => {
          // Loop enforcement
          if (prev.isLooping && prev.loopOut !== null && t >= prev.loopOut && prev.loopIn !== null) {
            audioARef.current!.currentTime = prev.loopIn;
            return { ...prev, currentTime: prev.loopIn };
          }
          return { ...prev, currentTime: t };
        });
      }
      if (audioBRef.current) {
        const t = audioBRef.current.currentTime;
        setDeckB(prev => {
          if (prev.isLooping && prev.loopOut !== null && t >= prev.loopOut && prev.loopIn !== null) {
            audioBRef.current!.currentTime = prev.loopIn;
            return { ...prev, currentTime: prev.loopIn };
          }
          return { ...prev, currentTime: t };
        });
      }

      // Waveform data
      if (analyserARef.current) {
        const data = new Uint8Array(analyserARef.current.frequencyBinCount);
        analyserARef.current.getByteFrequencyData(data);
        const peak = Math.max(...Array.from(data)) / 255;
        setDeckA(prev => ({ ...prev, waveformData: Array.from(data.slice(0, 64)), peakLevel: peak }));
      }
      if (analyserBRef.current) {
        const data = new Uint8Array(analyserBRef.current.frequencyBinCount);
        analyserBRef.current.getByteFrequencyData(data);
        const peak = Math.max(...Array.from(data)) / 255;
        setDeckB(prev => ({ ...prev, waveformData: Array.from(data.slice(0, 64)), peakLevel: peak }));
      }

      // Master VU
      if (masterAnalyserRef.current) {
        const data = new Uint8Array(masterAnalyserRef.current.frequencyBinCount);
        masterAnalyserRef.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length / 255;
        setMasterPeakL(avg);
        setMasterPeakR(avg * (0.9 + Math.random() * 0.2));
      }

      // Recording duration
      if (isRecording) {
        setRecordingDuration(Math.round((Date.now() - recordingStartRef.current) / 1000));
      }

      animFrameRef.current = requestAnimationFrame(updateLoop);
    };
    animFrameRef.current = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isRecording]);

  return {
    deckA, deckB, crossfader, channelFaderA, channelFaderB, masterVolume,
    masterPeakL, masterPeakR, isRecording, recordingDuration,
    loadTrack, playPause, setCuePoint, jumpToCue, setVolume, setBPM, syncBPM,
    setEQ, setGain, setFilter, setEcho, setActiveFx,
    updateCrossfader, updateChannelFader, updateMasterVolume, seek,
    setHotCue, jumpToHotCue, clearHotCue,
    setLoopIn, setLoopOut, setAutoLoop, toggleLoop, setBpmRange, tapBPM,
    startRecording, stopRecording,
  };
}
