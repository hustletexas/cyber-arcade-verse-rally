
export interface GamePhrase {
  phrase: string;
  category: string;
  hint?: string;
}

export const gamingPhrases: GamePhrase[] = [
  // Classic Gaming
  { phrase: "SUPER MARIO BROTHERS", category: "Classic Games", hint: "Nintendo's famous plumber duo" },
  { phrase: "THE LEGEND OF ZELDA", category: "Classic Games", hint: "Adventure in Hyrule" },
  { phrase: "FINAL FANTASY", category: "Classic Games", hint: "Long-running RPG series" },
  { phrase: "STREET FIGHTER", category: "Classic Games", hint: "Fighting game classic" },
  { phrase: "MORTAL KOMBAT", category: "Classic Games", hint: "Finish him!" },
  
  // Gaming Terms
  { phrase: "POWER UP", category: "Gaming Terms", hint: "Makes you stronger" },
  { phrase: "BOSS BATTLE", category: "Gaming Terms", hint: "Final enemy encounter" },
  { phrase: "GAME OVER", category: "Gaming Terms", hint: "You lost!" },
  { phrase: "HIGH SCORE", category: "Gaming Terms", hint: "Best achievement" },
  { phrase: "EXTRA LIFE", category: "Gaming Terms", hint: "Second chance" },
  { phrase: "LEVEL UP", category: "Gaming Terms", hint: "Character progression" },
  { phrase: "RESPAWN", category: "Gaming Terms", hint: "Come back to life" },
  { phrase: "SPEED RUN", category: "Gaming Terms", hint: "Complete as fast as possible" },
  
  // Modern Games
  { phrase: "CALL OF DUTY", category: "Modern Games", hint: "Military shooter series" },
  { phrase: "GRAND THEFT AUTO", category: "Modern Games", hint: "Open world crime game" },
  { phrase: "WORLD OF WARCRAFT", category: "Modern Games", hint: "Massive online RPG" },
  { phrase: "FORTNITE", category: "Modern Games", hint: "Battle royale phenomenon" },
  { phrase: "MINECRAFT", category: "Modern Games", hint: "Block building sandbox" },
  { phrase: "AMONG US", category: "Modern Games", hint: "Social deduction game" },
  
  // Gaming Characters
  { phrase: "SONIC THE HEDGEHOG", category: "Characters", hint: "Blue speedster" },
  { phrase: "MASTER CHIEF", category: "Characters", hint: "Halo's protagonist" },
  { phrase: "LARA CROFT", category: "Characters", hint: "Tomb Raider heroine" },
  { phrase: "PIKACHU", category: "Characters", hint: "Electric Pokemon mascot" },
  { phrase: "KRATOS", category: "Characters", hint: "God of War anti-hero" },
  { phrase: "LINK", category: "Characters", hint: "Green-clad hero of Hyrule" },
  
  // Gaming Consoles
  { phrase: "NINTENDO SWITCH", category: "Consoles", hint: "Hybrid portable console" },
  { phrase: "PLAYSTATION FIVE", category: "Consoles", hint: "Sony's latest console" },
  { phrase: "XBOX SERIES X", category: "Consoles", hint: "Microsoft's powerhouse" },
  { phrase: "STEAM DECK", category: "Consoles", hint: "Valve's handheld PC" },
  { phrase: "GAME BOY", category: "Consoles", hint: "Nintendo's portable pioneer" },
  
  // Gaming Phrases
  { phrase: "PRESS START TO PLAY", category: "Gaming Phrases", hint: "Classic arcade instruction" },
  { phrase: "PLAYER ONE READY", category: "Gaming Phrases", hint: "Getting ready to start" },
  { phrase: "ACHIEVEMENT UNLOCKED", category: "Gaming Phrases", hint: "You did something special" },
  { phrase: "LOADING PLEASE WAIT", category: "Gaming Phrases", hint: "Common screen message" },
  { phrase: "CONTINUE", category: "Gaming Phrases", hint: "Keep playing option" },
  { phrase: "NEW GAME PLUS", category: "Gaming Phrases", hint: "Start over with bonuses" }
];

export const getRandomPhrase = (): GamePhrase => {
  const randomIndex = Math.floor(Math.random() * gamingPhrases.length);
  return gamingPhrases[randomIndex];
};

export const getPhrasesByCategory = (category: string): GamePhrase[] => {
  return gamingPhrases.filter(phrase => phrase.category === category);
};

export const getCategories = (): string[] => {
  return Array.from(new Set(gamingPhrases.map(phrase => phrase.category)));
};
