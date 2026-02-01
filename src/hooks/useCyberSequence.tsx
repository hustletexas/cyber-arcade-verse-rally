import { useState, useCallback, useRef, useEffect } from 'react';
import {
  GameMode,
  ButtonColor,
  GameState,
  BUTTON_ORDER,
  DIFFICULTY_CONFIGS,
  SCORING,
} from '@/types/cyber-sequence';

const initialState: GameState = {
  sequence: [],
  playerInput: [],
  currentStep: 0,
  isPlayingSequence: false,
  isPlayerTurn: false,
  isFinished: false,
  score: 0,
  level: 1,
  streak: 0,
  bestStreak: 0,
  mistakes: 0,
  maxMistakes: null,
  lastInputTime: null,
  comboMultiplier: 1.0,
};

export function useCyberSequence(mode: GameMode) {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [activeButton, setActiveButton] = useState<ButtonColor | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [correctFlash, setCorrectFlash] = useState<ButtonColor | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const config = DIFFICULTY_CONFIGS[mode];

  const getPlaybackSpeed = useCallback((level: number) => {
    const speed = config.baseSpeed - (level - 1) * config.speedDecrement;
    return Math.max(speed, config.minSpeed);
  }, [config]);

  const generateRandomButton = useCallback((): ButtonColor => {
    const randomIndex = Math.floor(Math.random() * BUTTON_ORDER.length);
    return BUTTON_ORDER[randomIndex];
  }, []);

  const addToSequence = useCallback(() => {
    const newButton = generateRandomButton();
    setGameState(prev => ({
      ...prev,
      sequence: [...prev.sequence, newButton],
    }));
    return newButton;
  }, [generateRandomButton]);

  const playSequence = useCallback(async (sequence: ButtonColor[], level: number) => {
    setGameState(prev => ({
      ...prev,
      isPlayingSequence: true,
      isPlayerTurn: false,
      currentStep: 0,
    }));

    const speed = getPlaybackSpeed(level);
    
    // Small delay before starting
    await new Promise(resolve => setTimeout(resolve, 500));
    
    for (let i = 0; i < sequence.length; i++) {
      const button = sequence[i];
      setActiveButton(button);
      setGameState(prev => ({ ...prev, currentStep: i }));
      
      await new Promise(resolve => setTimeout(resolve, speed * 0.6));
      setActiveButton(null);
      await new Promise(resolve => setTimeout(resolve, speed * 0.4));
    }

    setGameState(prev => ({
      ...prev,
      isPlayingSequence: false,
      isPlayerTurn: true,
      playerInput: [],
      lastInputTime: Date.now(),
    }));
  }, [getPlaybackSpeed]);

  const startGame = useCallback(() => {
    const startingLength = config.startingLength;
    const initialSequence: ButtonColor[] = [];
    
    for (let i = 0; i < startingLength; i++) {
      initialSequence.push(generateRandomButton());
    }

    const newState: GameState = {
      ...initialState,
      sequence: initialSequence,
      maxMistakes: config.maxMistakes,
      level: 1,
    };
    
    setGameState(newState);
    setIsShaking(false);
    
    // Start playing after state is set
    setTimeout(() => {
      playSequence(initialSequence, 1);
    }, 100);
  }, [config, generateRandomButton, playSequence]);

  const handleMistake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
    
    setGameState(prev => {
      const newMistakes = prev.mistakes + 1;
      const gameOver = prev.maxMistakes !== null && newMistakes >= prev.maxMistakes;
      
      if (gameOver) {
        return {
          ...prev,
          mistakes: newMistakes,
          isFinished: true,
          isPlayerTurn: false,
          streak: 0,
          comboMultiplier: 1.0,
        };
      }
      
      // Reset player input and replay sequence
      return {
        ...prev,
        mistakes: newMistakes,
        playerInput: [],
        streak: 0,
        comboMultiplier: 1.0,
      };
    });
    
    // If not game over, replay the sequence after a delay
    setTimeout(() => {
      setGameState(prev => {
        if (!prev.isFinished) {
          playSequence(prev.sequence, prev.level);
        }
        return prev;
      });
    }, 1000);
  }, [playSequence]);

  const handleButtonPress = useCallback((color: ButtonColor) => {
    if (!gameState.isPlayerTurn || gameState.isFinished || gameState.isPlayingSequence) {
      return;
    }

    const expectedButton = gameState.sequence[gameState.playerInput.length];
    
    if (color !== expectedButton) {
      handleMistake();
      return;
    }

    // Correct input
    setCorrectFlash(color);
    setTimeout(() => setCorrectFlash(null), 200);

    const now = Date.now();
    const timeSinceLastInput = gameState.lastInputTime ? now - gameState.lastInputTime : 0;
    
    // Calculate score
    let pointsEarned = SCORING.basePoints;
    
    // Speed bonus
    if (timeSinceLastInput < SCORING.speedBonusThreshold) {
      pointsEarned += SCORING.speedBonusPoints;
    }
    
    // Combo multiplier
    pointsEarned = Math.floor(pointsEarned * gameState.comboMultiplier);
    
    const newInput = [...gameState.playerInput, color];
    const newStreak = gameState.streak + 1;
    const newBestStreak = Math.max(newStreak, gameState.bestStreak);
    const newCombo = Math.min(
      gameState.comboMultiplier + SCORING.comboMultiplierStep,
      SCORING.maxComboMultiplier
    );

    // Check if level complete
    if (newInput.length === gameState.sequence.length) {
      // Level complete bonus
      pointsEarned += SCORING.levelCompleteBonus * gameState.level;
      
      setGameState(prev => ({
        ...prev,
        playerInput: newInput,
        score: prev.score + pointsEarned,
        streak: newStreak,
        bestStreak: newBestStreak,
        comboMultiplier: newCombo,
        isPlayerTurn: false,
        level: prev.level + 1,
        lastInputTime: now,
      }));

      // Add new button and play next sequence
      setTimeout(() => {
        setGameState(prev => {
          const newButton = generateRandomButton();
          const newSequence = [...prev.sequence, newButton];
          
          setTimeout(() => {
            playSequence(newSequence, prev.level);
          }, 100);
          
          return {
            ...prev,
            sequence: newSequence,
            playerInput: [],
          };
        });
      }, 800);
    } else {
      setGameState(prev => ({
        ...prev,
        playerInput: newInput,
        score: prev.score + pointsEarned,
        streak: newStreak,
        bestStreak: newBestStreak,
        comboMultiplier: newCombo,
        lastInputTime: now,
      }));
    }
  }, [gameState, handleMistake, generateRandomButton, playSequence]);

  const resetGame = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
    setGameState(initialState);
    setActiveButton(null);
    setIsShaking(false);
    setCorrectFlash(null);
  }, []);

  const calculateTickets = useCallback(() => {
    let tickets = SCORING.ticketsPerRun;
    
    // Perfect run bonus (no mistakes)
    if (gameState.mistakes === 0 && gameState.level > 3) {
      tickets += SCORING.ticketsPerfectRun;
    }
    
    return tickets;
  }, [gameState.mistakes, gameState.level]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
    };
  }, []);

  return {
    gameState,
    activeButton,
    isShaking,
    correctFlash,
    startGame,
    handleButtonPress,
    resetGame,
    calculateTickets,
    getPlaybackSpeed,
  };
}
