
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Timer as TimerIcon, Settings, Plus, Minus, Zap, X, Check, Dice5, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// ——— Types ———
export type Clue = {
  id: string;
  value: number; // points
  question: string;
  answer: string;
  dailyDouble?: boolean;
  finalRound?: boolean; // if true, reserved for Final Jeopardy
};

export type Category = {
  id: string;
  title: string;
  clues: Clue[]; // order = ascending value
};

export type GameData = {
  categories: Category[];
  final?: { prompt: string; answer: string };
};

export type GameOptions = {
  timerSeconds?: number;
  boardCols?: number; // defaults to categories length
  boardRows?: number; // defaults to clues length
  enableBuzzers?: boolean; // keyboard 1..4 to buzz
};

export type JeopardyGameProps = {
  data?: GameData;
  options?: GameOptions;
  onAward?: (teamId: string, delta: number, meta: { clueId: string; categoryId: string }) => void;
};

// ——— Sample Data (5x5) ———
const sampleData: GameData = {
  categories: [
    {
      id: "blockchains",
      title: "Blockchains",
      clues: [
        { id: "b100", value: 100, question: "Which blockchain powers SOL?", answer: "Solana" },
        { id: "b200", value: 200, question: "XLM is native to which network?", answer: "Stellar" },
        { id: "b300", value: 300, question: "What is Ethereum's token?", answer: "ETH" },
        { id: "b400", value: 400, question: "What consensus does Bitcoin use?", answer: "Proof of Work" },
        { id: "b500", value: 500, question: "What VM runs Solidity contracts?", answer: "EVM" },
      ],
    },
    {
      id: "gaming",
      title: "Gaming",
      clues: [
        { id: "g100", value: 100, question: "Nintendo's plumber hero?", answer: "Mario" },
        { id: "g200", value: 200, question: "Master Chief's franchise?", answer: "Halo" },
        { id: "g300", value: 300, question: "Battle royale by Epic Games?", answer: "Fortnite" },
        { id: "g400", value: 400, question: "Speedy blue SEGA mascot?", answer: "Sonic" },
        { id: "g500", value: 500, question: "FromSoftware 2022 GOTY?", answer: "Elden Ring" },
      ],
    },
    {
      id: "arcade",
      title: "Arcade Legends",
      clues: [
        { id: "a100", value: 100, question: "Chomps pellets, avoids ghosts.", answer: "Pac-Man" },
        { id: "a200", value: 200, question: "Alien-shooting classic.", answer: "Space Invaders" },
        { id: "a300", value: 300, question: "Barrel-hurling ape vs. Mario.", answer: "Donkey Kong" },
        { id: "a400", value: 400, question: "Ball-and-paddle brick breaker.", answer: "Breakout" },
        { id: "a500", value: 500, question: "Isometric Q*?", answer: "Q*bert" },
      ],
    },
    {
      id: "crypto",
      title: "Crypto Basics",
      clues: [
        { id: "c100", value: 100, question: "Stablecoin pegged to USD at Coinbase/Circle.", answer: "USDC" },
        { id: "c200", value: 200, question: "Self-hosted key storage is called?", answer: "Cold Wallet" },
        { id: "c300", value: 300, question: "Network fee on Ethereum.", answer: "Gas" },
        { id: "c400", value: 400, question: "Verifiable on-chain history.", answer: "Blockchain" },
        { id: "c500", value: 500, question: "Automated on-chain program.", answer: "Smart Contract" },
      ],
    },
    {
      id: "cca",
      title: "Cyber City Arcade",
      clues: [
        { id: "cc100", value: 100, question: "$CCTR belongs to which brand?", answer: "Cyber City Arcade" },
        { id: "cc200", value: 200, question: "City where our founder reps the skyline.", answer: "Houston" },
        { id: "cc300", value: 300, question: "Tournament login method: wallet or ____.", answer: "Google" },
        { id: "cc400", value: 400, question: "Two chains we integrate first.", answer: "Stellar & Solana" },
        { id: "cc500", value: 500, question: "DB used for leaderboards.", answer: "Supabase" },
      ],
    },
  ],
  final: { prompt: "Term for users proving they control a private key.", answer: "Signing" },
};

// ——— Utility ———
const useLocalStorage = <T,>(key: string, initial: T) => {
  const [val, setVal] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  }, [key, val]);
  return [val, setVal] as const;
};

// ——— Timer Ring ———
function TimerRing({ seconds, running, onElapsed }: { seconds: number; running: boolean; onElapsed: () => void }) {
  const [remain, setRemain] = useState(seconds);
  const tickRef = useRef<number | null>(null);
  useEffect(() => setRemain(seconds), [seconds]);
  useEffect(() => {
    if (!running) {
      if (tickRef.current) cancelAnimationFrame(tickRef.current);
      tickRef.current = null;
      return;
    }
    const start = performance.now();
    let last = start;
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      setRemain((r) => {
        const nr = Math.max(0, r - dt);
        if (nr === 0) onElapsed();
        return nr;
      });
      tickRef.current = requestAnimationFrame(loop);
    };
    tickRef.current = requestAnimationFrame(loop);
    return () => {
      if (tickRef.current) cancelAnimationFrame(tickRef.current);
    };
  }, [running, onElapsed]);
  const pct = Math.round((remain / seconds) * 100);
  return (
    <div className="flex items-center gap-2">
      <TimerIcon className="h-5 w-5" />
      <div className="w-40 h-3 rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="tabular-nums text-sm w-10 text-right">{Math.ceil(remain)}</span>
    </div>
  );
}

// ——— Main Component ———
export default function JeopardyGame({ data = sampleData, options, onAward }: JeopardyGameProps) {
  const timerSeconds = options?.timerSeconds ?? 20;
  const boardCols = options?.boardCols ?? data.categories.length;
  const boardRows = options?.boardRows ?? data.categories[0]?.clues.length ?? 5;
  const enableBuzzers = options?.enableBuzzers ?? true;

  const [teams, setTeams] = useLocalStorage(
    "cca-jeopardy-teams",
    [
      { id: "t1", name: "Team 1", score: 0 },
      { id: "t2", name: "Team 2", score: 0 },
      { id: "t3", name: "Team 3", score: 0 },
      { id: "t4", name: "Team 4", score: 0 },
    ]
  );

  const [opened, setOpened] = useLocalStorage<string[]>("cca-jeopardy-opened", []);
  const [active, setActive] = useState<{ cat: Category; clue: Clue } | null>(null);
  const [reveal, setReveal] = useState(false);
  const [timerOn, setTimerOn] = useState(false);
  const [buzzerTeam, setBuzzerTeam] = useState<string | null>(null);
  const [wagers, setWagers] = useState<Record<string, number>>({});
  const [finalMode, setFinalMode] = useState(false);

  // Keyboard Buzzers 1..4
  useEffect(() => {
    if (!enableBuzzers) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (["1", "2", "3", "4"].includes(e.key)) {
        setBuzzerTeam((prev) => prev ?? teams[Number(e.key) - 1]?.id);
        setTimerOn(false);
      }
      if (e.code === "Space") setTimerOn((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [teams, enableBuzzers]);

  const boardMap = useMemo(() => {
    const map = new Map<string, { cat: Category; clue: Clue }>();
    data.categories.forEach((cat) => cat.clues.forEach((clue) => map.set(`${cat.id}:${clue.id}`, { cat, clue })));
    return map;
  }, [data]);

  const isOpened = (catId: string, clueId: string) => opened.includes(`${catId}:${clueId}`);

  const handleOpenClue = (cat: Category, clue: Clue) => {
    if (isOpened(cat.id, clue.id)) return; // already used
    setActive({ cat, clue });
    setReveal(false);
    setTimerOn(true);
    setBuzzerTeam(null);
  };

  const handleCloseClue = () => {
    if (!active) return;
    const key = `${active.cat.id}:${active.clue.id}`;
    if (!opened.includes(key)) setOpened((o) => [...o, key]);
    setActive(null);
    setReveal(false);
    setTimerOn(false);
    setBuzzerTeam(null);
  };

  const adjustScore = (teamId: string, delta: number) => {
    setTeams((ts) => ts.map((t) => (t.id === teamId ? { ...t, score: t.score + delta } : t)));
    if (active) onAward?.(teamId, delta, { clueId: active.clue.id, categoryId: active.cat.id });
  };

  const onElapsed = () => setTimerOn(false);

  // Final mode triggers when all non-final clues opened
  useEffect(() => {
    const totalPlayable = data.categories.reduce((acc, c) => acc + c.clues.filter((cl) => !cl.finalRound).length, 0);
    const openedPlayable = opened.filter((k) => !boardMap.get(k)?.clue.finalRound).length;
    if (totalPlayable > 0 && openedPlayable === totalPlayable) setFinalMode(true);
  }, [opened, data, boardMap]);

  const resetGame = () => {
    setOpened([]);
    setActive(null);
    setReveal(false);
    setTimerOn(false);
    setBuzzerTeam(null);
    setFinalMode(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-white p-4 md:p-8">
      <header className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Swords className="h-7 w-7 text-cyan-400" />
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Cyber City Arcade — Jeopardy</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={resetGame} className="rounded-2xl">Reset Board</Button>
          <Settings className="h-5 w-5 opacity-70" />
        </div>
      </header>

      {/* Scoreboard */}
      <div className="grid md:grid-cols-4 gap-3 mb-6">
        {teams.map((t, idx) => (
          <Card key={t.id} className={`bg-gray-900/60 border-gray-700 ${buzzerTeam === t.id ? "ring-2 ring-yellow-400" : ""}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  <Input
                    value={t.name}
                    onChange={(e) => setTeams((ts) => ts.map((x) => (x.id === t.id ? { ...x, name: e.target.value } : x)))}
                    className="h-8 bg-gray-800 border-gray-700 text-white"
                  />
                </CardTitle>
                <span className="text-xs opacity-70">Buzz: {idx + 1}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-black tabular-nums">{t.score}</div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => adjustScore(t.id, -100)} className="rounded-xl"><Minus className="h-4 w-4" /></Button>
                  <Button size="sm" onClick={() => adjustScore(t.id, +100)} className="rounded-xl"><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Board */}
      <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${boardCols}, minmax(0, 1fr))` }}>
        {data.categories.map((cat) => (
          <div key={cat.id} className="flex flex-col gap-2">
            <div className="text-center font-extrabold uppercase tracking-wider text-cyan-300 py-2 bg-gray-900/70 rounded-xl border border-gray-700">
              {cat.title}
            </div>
            {cat.clues.slice(0, boardRows).map((clue) => {
              const used = isOpened(cat.id, clue.id);
              return (
                <motion.button
                  key={clue.id}
                  whileHover={{ scale: used ? 1.0 : 1.02 }}
                  whileTap={{ scale: used ? 1.0 : 0.98 }}
                  onClick={() => handleOpenClue(cat, clue)}
                  disabled={used}
                  className={`aspect-[4/1] md:aspect-[5/2] rounded-xl border text-center grid place-items-center text-2xl font-black tabular-nums 
                    ${used ? "bg-gray-800/50 border-gray-800 text-gray-600 line-through" : "bg-blue-900/60 border-blue-700 hover:shadow-lg"}`}
                >
                  {clue.value}
                  {clue.dailyDouble && !used && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full"><Dice5 className="h-3 w-3" /> DD</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Active Clue Dialog */}
      <Dialog open={!!active} onOpenChange={(v) => (!v ? handleCloseClue() : null)}>
        <DialogContent className="bg-gray-900/95 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {active?.cat.title} — <span className="text-cyan-300 font-black">{active?.clue.value}</span>
                {active?.clue.dailyDouble && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full"><Dice5 className="h-3 w-3" /> Daily Double</span>
                )}
              </span>
              <TimerRing seconds={timerSeconds} running={timerOn} onElapsed={onElapsed} />
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Question / Answer */}
            <AnimatePresence mode="wait">
              {!reveal ? (
                <motion.div key="q" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-xl md:text-2xl leading-relaxed">
                  {active?.clue.question}
                </motion.div>
              ) : (
                <motion.div key="a" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-xl md:text-2xl leading-relaxed text-emerald-300">
                  Answer: <span className="font-black">{active?.clue.answer}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={() => setReveal((v) => !v)} className="rounded-xl">
                {reveal ? "Hide Answer" : "Reveal Answer"}
              </Button>
              <Button onClick={() => setTimerOn((v) => !v)} className="rounded-xl">
                {timerOn ? "Pause Timer" : "Start Timer"}
              </Button>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs opacity-70">Buzzers 1–4</span>
                <Switch checked={enableBuzzers} disabled />
              </div>
            </div>

            {/* Award / Deduct to Buzzer or Pick Team */}
            <div className="grid md:grid-cols-2 gap-3">
              <Card className="bg-gray-900/60 border-gray-700">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Buzzer</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm opacity-80">{buzzerTeam ? teams.find((t) => t.id === buzzerTeam)?.name : "No buzz yet"}</div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" disabled={!buzzerTeam} onClick={() => buzzerTeam && adjustScore(buzzerTeam, -(active?.clue.value ?? 0))} className="rounded-xl">
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" disabled={!buzzerTeam} onClick={() => buzzerTeam && adjustScore(buzzerTeam, +(active?.clue.value ?? 0))} className="rounded-xl">
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/60 border-gray-700">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Manual Award</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-2">
                    {teams.map((t) => (
                      <div key={t.id} className="flex items-center justify-between gap-2 bg-gray-800/60 rounded-lg px-2 py-1.5">
                        <span className="text-sm truncate">{t.name}</span>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="secondary" onClick={() => adjustScore(t.id, -(active?.clue.value ?? 0))} className="rounded-lg"><Minus className="h-3 w-3" /></Button>
                          <Button size="sm" onClick={() => adjustScore(t.id, +(active?.clue.value ?? 0))} className="rounded-lg"><Plus className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={handleCloseClue} className="rounded-xl">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final Round */}
      <AnimatePresence>
        {finalMode && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mt-8">
            <Card className="bg-purple-900/30 border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-100">
                  <Zap className="h-5 w-5" /> Final Round
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-3">
                  {teams.map((t) => (
                    <div key={t.id} className="bg-purple-900/20 border border-purple-800 rounded-xl p-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="font-bold">{t.name}</div>
                        <div className="text-sm opacity-80">Score: {t.score}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input type="number" placeholder="Wager" className="bg-purple-950/60 border-purple-800" value={wagers[t.id] ?? ""} onChange={(e) => setWagers((w) => ({ ...w, [t.id]: Number(e.target.value || 0) }))} />
                        <Button size="sm" onClick={() => setWagers((w) => ({ ...w, [t.id]: Math.min(Math.max(0, t.score), t.score) }))} className="rounded-xl">Max</Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-800">
                  <div className="text-lg md:text-xl font-semibold mb-2">{data.final?.prompt}</div>
                  <details className="opacity-90">
                    <summary className="cursor-pointer select-none">Reveal Final Answer</summary>
                    <div className="mt-2 text-emerald-300 font-black">{data.final?.answer}</div>
                  </details>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {teams.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 bg-purple-900/30 px-3 py-1.5 rounded-xl">
                      <span className="text-sm">{t.name}</span>
                      <Button size="sm" variant="secondary" className="rounded-lg" onClick={() => adjustScore(t.id, -(wagers[t.id] ?? 0))}><X className="h-3 w-3" /></Button>
                      <Button size="sm" className="rounded-lg" onClick={() => adjustScore(t.id, +(wagers[t.id] ?? 0))}><Check className="h-3 w-3" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Help */}
      <div className="mt-8 text-xs opacity-70 space-y-1">
        <p>Shortcuts: <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Space</kbd> start/pause timer • <kbd className="px-1.5 py-0.5 bg-white/10 rounded">1-4</kbd> buzzers</p>
        <p>Tip: Replace <code>sampleData</code> with your own categories & clues. Persist to a DB for multi-host events.</p>
      </div>
    </div>
  );
}
