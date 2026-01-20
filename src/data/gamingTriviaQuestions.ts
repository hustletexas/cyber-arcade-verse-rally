
import { TriviaQuestion } from '@/types/trivia';

export const gamingTriviaQuestions: Record<string, TriviaQuestion[]> = {
  nintendo64: [
    {
      id: 'n64_1',
      category: 'nintendo64',
      question: 'What year was the Nintendo 64 first released in Japan?',
      option_a: '1995',
      option_b: '1996',
      option_c: '1997',
      option_d: '1998',
      correct_answer: 'B',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'n64_2',
      category: 'nintendo64',
      question: 'Which was the first 3D Super Mario game?',
      option_a: 'Super Mario Bros. 3',
      option_b: 'Super Mario World',
      option_c: 'Super Mario 64',
      option_d: 'Super Mario Sunshine',
      correct_answer: 'C',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'n64_3',
      category: 'nintendo64',
      question: 'In The Legend of Zelda: Ocarina of Time, what is the name of Link\'s horse?',
      option_a: 'Roach',
      option_b: 'Epona',
      option_c: 'Agro',
      option_d: 'Shadowfax',
      correct_answer: 'B',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'n64_4',
      category: 'nintendo64',
      question: 'What weapon does Bond start with in GoldenEye 007\'s first mission?',
      option_a: 'AK-74',
      option_b: 'PP7',
      option_c: 'KF7 Soviet',
      option_d: 'RCP-90',
      correct_answer: 'B',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'n64_5',
      category: 'nintendo64',
      question: 'In Super Mario 64, how many Power Stars are needed to access the final Bowser battle?',
      option_a: '50',
      option_b: '60',
      option_c: '70',
      option_d: '80',
      correct_answer: 'C',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'n64_6',
      category: 'nintendo64',
      question: 'What company developed the original Super Smash Bros. for N64?',
      option_a: 'Nintendo EAD',
      option_b: 'Intelligent Systems',
      option_c: 'HAL Laboratory',
      option_d: 'Game Freak',
      correct_answer: 'C',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  
  playstation1: [
    {
      id: 'ps1_1',
      category: 'playstation1',
      question: 'What year was the original PlayStation released?',
      option_a: '1994',
      option_b: '1995',
      option_c: '1996',
      option_d: '1997',
      correct_answer: 'A',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'ps1_2',
      category: 'playstation1',
      question: 'Who is the main character in the Crash Bandicoot series?',
      option_a: 'Spyro',
      option_b: 'Crash',
      option_c: 'Cortex',
      option_d: 'Coco',
      correct_answer: 'B',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'ps1_3',
      category: 'playstation1',
      question: 'In Final Fantasy VII, what is Cloud\'s signature weapon?',
      option_a: 'Masamune',
      option_b: 'Ultima Weapon',
      option_c: 'Buster Sword',
      option_d: 'Excalibur',
      correct_answer: 'C',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'ps1_4',
      category: 'playstation1',
      question: 'What is the name of the city in the first Resident Evil game?',
      option_a: 'Silent Hill',
      option_b: 'Raccoon City',
      option_c: 'Midgar',
      option_d: 'Liberty City',
      correct_answer: 'B',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'ps1_5',
      category: 'playstation1',
      question: 'In Metal Gear Solid, what is Solid Snake\'s real name?',
      option_a: 'Jack',
      option_b: 'David',
      option_c: 'Gray Fox',
      option_d: 'Big Boss',
      correct_answer: 'B',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'ps1_6',
      category: 'playstation1',
      question: 'Which company developed the original Gran Turismo?',
      option_a: 'Namco',
      option_b: 'Capcom',
      option_c: 'Polyphony Digital',
      option_d: 'Square',
      correct_answer: 'C',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],

  playstation2: [
    {
      id: 'ps2_1',
      category: 'playstation2',
      question: 'What year was the PlayStation 2 released?',
      option_a: '1999',
      option_b: '2000',
      option_c: '2001',
      option_d: '2002',
      correct_answer: 'B',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'ps2_2',
      category: 'playstation2',
      question: 'Which Grand Theft Auto game was set in Vice City?',
      option_a: 'GTA III',
      option_b: 'GTA: Vice City',
      option_c: 'GTA: San Andreas',
      option_d: 'GTA IV',
      correct_answer: 'B',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'ps2_3',
      category: 'playstation2',
      question: 'In God of War, what is Kratos seeking revenge against?',
      option_a: 'Zeus',
      option_b: 'Ares',
      option_c: 'Poseidon',
      option_d: 'Hades',
      correct_answer: 'B',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'ps2_4',
      category: 'playstation2',
      question: 'What is the name of the main character in Shadow of the Colossus?',
      option_a: 'Ico',
      option_b: 'Wander',
      option_c: 'Agro',
      option_d: 'Mono',
      correct_answer: 'B',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'ps2_5',
      category: 'playstation2',
      question: 'In Final Fantasy X, what is the name of Tidus\'s home city?',
      option_a: 'Midgar',
      option_b: 'Zanarkand',
      option_c: 'Spira',
      option_d: 'Besaid',
      correct_answer: 'B',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'ps2_6',
      category: 'playstation2',
      question: 'Which developer created the Jak and Daxter series?',
      option_a: 'Insomniac Games',
      option_b: 'Naughty Dog',
      option_c: 'Sucker Punch',
      option_d: 'Santa Monica Studio',
      correct_answer: 'B',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],

  xbox: [
    {
      id: 'xbox_1',
      category: 'xbox',
      question: 'What year was the original Xbox released?',
      option_a: '2000',
      option_b: '2001',
      option_c: '2002',
      option_d: '2003',
      correct_answer: 'B',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'xbox_2',
      category: 'xbox',
      question: 'Who is the main character in the Halo series?',
      option_a: 'Marcus Fenix',
      option_b: 'Master Chief',
      option_c: 'Cortana',
      option_d: 'Commander Shepard',
      correct_answer: 'B',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'xbox_3',
      category: 'xbox',
      question: 'In Fable, what is the name of the main character\'s hometown?',
      option_a: 'Bowerstone',
      option_b: 'Oakvale',
      option_c: 'Knothole Glade',
      option_d: 'Hook Coast',
      correct_answer: 'B',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'xbox_4',
      category: 'xbox',
      question: 'What is the name of the protagonist in Knights of the Old Republic?',
      option_a: 'Darth Revan',
      option_b: 'Bastila Shan',
      option_c: 'Player-defined',
      option_d: 'Carth Onasi',
      correct_answer: 'C',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'xbox_5',
      category: 'xbox',
      question: 'In Halo: Combat Evolved, what is the name of the ring world?',
      option_a: 'Installation 04',
      option_b: 'Alpha Halo',
      option_c: 'Both A and B',
      option_d: 'The Ark',
      correct_answer: 'C',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'xbox_6',
      category: 'xbox',
      question: 'Which company developed the Splinter Cell series?',
      option_a: 'Microsoft Game Studios',
      option_b: 'Ubisoft Montreal',
      option_c: 'Rare',
      option_d: 'Bungie',
      correct_answer: 'B',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],

  gamecube: [
    {
      id: 'gc_1',
      category: 'gamecube',
      question: 'What year was the Nintendo GameCube released?',
      option_a: '2000',
      option_b: '2001',
      option_c: '2002',
      option_d: '2003',
      correct_answer: 'B',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'gc_2',
      category: 'gamecube',
      question: 'Which Metroid game was released exclusively for GameCube?',
      option_a: 'Metroid Fusion',
      option_b: 'Metroid: Zero Mission',
      option_c: 'Metroid Prime',
      option_d: 'Super Metroid',
      correct_answer: 'C',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'gc_3',
      category: 'gamecube',
      question: 'In Animal Crossing, what is the name of the player\'s character?',
      option_a: 'Tom Nook',
      option_b: 'K.K. Slider',
      option_c: 'Player-defined',
      option_d: 'Isabelle',
      correct_answer: 'C',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'gc_4',
      category: 'gamecube',
      question: 'What is the subtitle of the GameCube Zelda game?',
      option_a: 'Ocarina of Time',
      option_b: 'Majora\'s Mask',
      option_c: 'The Wind Waker',
      option_d: 'Twilight Princess',
      correct_answer: 'C',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'gc_5',
      category: 'gamecube',
      question: 'In Pikmin, what is the name of the main character?',
      option_a: 'Olimar',
      option_b: 'Louie',
      option_c: 'Alph',
      option_d: 'Brittany',
      correct_answer: 'A',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'gc_6',
      category: 'gamecube',
      question: 'Which company developed F-Zero GX?',
      option_a: 'Nintendo EAD',
      option_b: 'Amusement Vision',
      option_c: 'Intelligent Systems',
      option_d: 'HAL Laboratory',
      correct_answer: 'B',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],

  retro: [
    {
      id: 'retro_1',
      category: 'retro',
      question: 'What year did the original Super Mario Bros. release?',
      option_a: '1983',
      option_b: '1984',
      option_c: '1985',
      option_d: '1986',
      correct_answer: 'C',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'retro_2',
      category: 'retro',
      question: 'Which character is known for saying "It\'s-a me!"?',
      option_a: 'Luigi',
      option_b: 'Mario',
      option_c: 'Wario',
      option_d: 'Yoshi',
      correct_answer: 'B',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'retro_3',
      category: 'retro',
      question: 'What does "NES" stand for?',
      option_a: 'New Entertainment System',
      option_b: 'Nintendo Entertainment System',
      option_c: 'Nintendo Electronic System',
      option_d: 'New Electronic System',
      correct_answer: 'B',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'retro_4',
      category: 'retro',
      question: 'In the original Donkey Kong, what was Mario originally called?',
      option_a: 'Jumpman',
      option_b: 'Mr. Video',
      option_c: 'Plumber Man',
      option_d: 'Red Man',
      correct_answer: 'A',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'retro_5',
      category: 'retro',
      question: 'What was the first commercially successful video game?',
      option_a: 'Pong',
      option_b: 'Space Invaders',
      option_c: 'Pac-Man',
      option_d: 'Asteroids',
      correct_answer: 'A',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'retro_6',
      category: 'retro',
      question: 'Which company created Sonic the Hedgehog?',
      option_a: 'Nintendo',
      option_b: 'Sega',
      option_c: 'Capcom',
      option_d: 'Konami',
      correct_answer: 'B',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],

  arcade: [
    {
      id: 'arcade_1',
      category: 'arcade',
      question: 'What color is Pac-Man?',
      option_a: 'Blue',
      option_b: 'Red',
      option_c: 'Yellow',
      option_d: 'Green',
      correct_answer: 'C',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'arcade_2',
      category: 'arcade',
      question: 'In Street Fighter II, which character throws fireballs?',
      option_a: 'Ryu',
      option_b: 'Chun-Li',
      option_c: 'Zangief',
      option_d: 'Blanka',
      correct_answer: 'A',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'arcade_3',
      category: 'arcade',
      question: 'What is the highest-scoring target in Galaga?',
      option_a: 'Bee',
      option_b: 'Butterfly',
      option_c: 'Flagship',
      option_d: 'Bonus Stage UFO',
      correct_answer: 'D',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'arcade_4',
      category: 'arcade',
      question: 'In Donkey Kong, what does Mario throw at Donkey Kong?',
      option_a: 'Bananas',
      option_b: 'Hammers',
      option_c: 'Fireballs',
      option_d: 'Barrels',
      correct_answer: 'B',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'arcade_5',
      category: 'arcade',
      question: 'What company originally developed Street Fighter?',
      option_a: 'SNK',
      option_b: 'Capcom',
      option_c: 'Namco',
      option_d: 'Konami',
      correct_answer: 'B',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'arcade_6',
      category: 'arcade',
      question: 'In the original Space Invaders, how many points is the UFO worth?',
      option_a: '50-300 points',
      option_b: '100-500 points',
      option_c: '200-1000 points',
      option_d: 'Random',
      correct_answer: 'A',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],

  'pc-gaming': [
    {
      id: 'pc_1',
      category: 'pc-gaming',
      question: 'What year was Half-Life first released?',
      option_a: '1997',
      option_b: '1998',
      option_c: '1999',
      option_d: '2000',
      correct_answer: 'B',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'pc_2',
      category: 'pc-gaming',
      question: 'Which company developed Counter-Strike?',
      option_a: 'Valve',
      option_b: 'Minh Le and Jess Cliffe',
      option_c: 'id Software',
      option_d: 'Epic Games',
      correct_answer: 'B',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'pc_3',
      category: 'pc-gaming',
      question: 'In World of Warcraft, what are the two main factions?',
      option_a: 'Alliance and Horde',
      option_b: 'Empire and Rebels',
      option_c: 'Order and Chaos',
      option_d: 'Light and Dark',
      correct_answer: 'A',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'pc_4',
      category: 'pc-gaming',
      question: 'What is the name of the protagonist in Half-Life?',
      option_a: 'Adrian Shephard',
      option_b: 'Gordon Freeman',
      option_c: 'Barney Calhoun',
      option_d: 'G-Man',
      correct_answer: 'B',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'pc_5',
      category: 'pc-gaming',
      question: 'Which game engine powers the original Quake?',
      option_a: 'Unreal Engine',
      option_b: 'id Tech 1',
      option_c: 'Quake Engine',
      option_d: 'Source Engine',
      correct_answer: 'C',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'pc_6',
      category: 'pc-gaming',
      question: 'What does "RTS" stand for in gaming?',
      option_a: 'Real Time Strategy',
      option_b: 'Real Time Simulation',
      option_c: 'Role Time Strategy',
      option_d: 'Rapid Time System',
      correct_answer: 'A',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],

  'nintendo-handheld': [
    {
      id: 'nh_1',
      category: 'nintendo-handheld',
      question: 'What year was the original Game Boy released?',
      option_a: '1988',
      option_b: '1989',
      option_c: '1990',
      option_d: '1991',
      correct_answer: 'B',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'nh_2',
      category: 'nintendo-handheld',
      question: 'Which Pokémon is #001 in the National Pokédex?',
      option_a: 'Pikachu',
      option_b: 'Mew',
      option_c: 'Bulbasaur',
      option_d: 'Charmander',
      correct_answer: 'C',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'nh_3',
      category: 'nintendo-handheld',
      question: 'What is the name of Link\'s fairy companion in Link\'s Awakening?',
      option_a: 'Navi',
      option_b: 'Tatl',
      option_c: 'Midna',
      option_d: 'None - Link has no fairy companion in Link\'s Awakening',
      correct_answer: 'D',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'nh_4',
      category: 'nintendo-handheld',
      question: 'In Pokémon Red/Blue, what is the name of your rival?',
      option_a: 'Gary',
      option_b: 'Blue',
      option_c: 'Player-defined',
      option_d: 'Silver',
      correct_answer: 'C',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'nh_5',
      category: 'nintendo-handheld',
      question: 'What does "DS" stand for in Nintendo DS?',
      option_a: 'Dual Screen',
      option_b: 'Developer\'s System',
      option_c: 'Digital System',
      option_d: 'Double Screen',
      correct_answer: 'A',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'nh_6',
      category: 'nintendo-handheld',
      question: 'Which company developed the Metroid II: Return of Samus?',
      option_a: 'Nintendo R&D1',
      option_b: 'Intelligent Systems',
      option_c: 'Retro Studios',
      option_d: 'Team Ninja',
      correct_answer: 'A',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],

  // ENTERTAINMENT CATEGORIES
  cartoons: [
    {
      id: 'cartoon_1',
      category: 'cartoons',
      question: 'What is the name of SpongeBob\'s best friend?',
      option_a: 'Squidward',
      option_b: 'Patrick',
      option_c: 'Mr. Krabs',
      option_d: 'Plankton',
      correct_answer: 'B',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'cartoon_2',
      category: 'cartoons',
      question: 'In "The Simpsons", what is Homer\'s favorite beer?',
      option_a: 'Budweiser',
      option_b: 'Duff',
      option_c: 'Buzz Cola',
      option_d: 'Pawtucket',
      correct_answer: 'B',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'cartoon_3',
      category: 'cartoons',
      question: 'Which cartoon features the Powerpuff Girls?',
      option_a: 'Nickelodeon',
      option_b: 'Disney Channel',
      option_c: 'Cartoon Network',
      option_d: 'Fox Kids',
      correct_answer: 'C',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'cartoon_4',
      category: 'cartoons',
      question: 'What is the name of the dragon in "Dragon Ball Z"?',
      option_a: 'Shenron',
      option_b: 'Dragonite',
      option_c: 'Puff',
      option_d: 'Charizard',
      correct_answer: 'A',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'cartoon_5',
      category: 'cartoons',
      question: 'In "Avatar: The Last Airbender", what element can Aang bend first?',
      option_a: 'Water',
      option_b: 'Earth',
      option_c: 'Fire',
      option_d: 'Air',
      correct_answer: 'D',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'cartoon_6',
      category: 'cartoons',
      question: 'What year did "Tom and Jerry" first premiere?',
      option_a: '1940',
      option_b: '1945',
      option_c: '1950',
      option_d: '1935',
      correct_answer: 'A',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],

  sports: [
    {
      id: 'sports_1',
      category: 'sports',
      question: 'How many players are on a standard soccer team on the field?',
      option_a: '9',
      option_b: '10',
      option_c: '11',
      option_d: '12',
      correct_answer: 'C',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'sports_2',
      category: 'sports',
      question: 'In basketball, how many points is a shot from beyond the arc worth?',
      option_a: '1',
      option_b: '2',
      option_c: '3',
      option_d: '4',
      correct_answer: 'C',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'sports_3',
      category: 'sports',
      question: 'Which country has won the most FIFA World Cups?',
      option_a: 'Germany',
      option_b: 'Argentina',
      option_c: 'Italy',
      option_d: 'Brazil',
      correct_answer: 'D',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'sports_4',
      category: 'sports',
      question: 'Who holds the record for most Olympic gold medals?',
      option_a: 'Usain Bolt',
      option_b: 'Michael Phelps',
      option_c: 'Carl Lewis',
      option_d: 'Mark Spitz',
      correct_answer: 'B',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'sports_5',
      category: 'sports',
      question: 'In tennis, what is a score of 40-40 called?',
      option_a: 'Advantage',
      option_b: 'Love',
      option_c: 'Deuce',
      option_d: 'Break',
      correct_answer: 'C',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'sports_6',
      category: 'sports',
      question: 'Which NFL team has won the most Super Bowls?',
      option_a: 'Dallas Cowboys',
      option_b: 'New England Patriots',
      option_c: 'Pittsburgh Steelers',
      option_d: 'San Francisco 49ers',
      correct_answer: 'B',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],

  music: [
    {
      id: 'music_1',
      category: 'music',
      question: 'Which band performed "Bohemian Rhapsody"?',
      option_a: 'The Beatles',
      option_b: 'Led Zeppelin',
      option_c: 'Queen',
      option_d: 'Pink Floyd',
      correct_answer: 'C',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'music_2',
      category: 'music',
      question: 'Who is known as the "King of Pop"?',
      option_a: 'Prince',
      option_b: 'Michael Jackson',
      option_c: 'Elvis Presley',
      option_d: 'Madonna',
      correct_answer: 'B',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'music_3',
      category: 'music',
      question: 'Which instrument has 88 keys?',
      option_a: 'Guitar',
      option_b: 'Organ',
      option_c: 'Accordion',
      option_d: 'Piano',
      correct_answer: 'D',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'music_4',
      category: 'music',
      question: 'What year did The Beatles break up?',
      option_a: '1968',
      option_b: '1969',
      option_c: '1970',
      option_d: '1971',
      correct_answer: 'C',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'music_5',
      category: 'music',
      question: 'Which artist has the most Grammy Awards of all time?',
      option_a: 'Beyoncé',
      option_b: 'Quincy Jones',
      option_c: 'Georg Solti',
      option_d: 'Alison Krauss',
      correct_answer: 'A',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'music_6',
      category: 'music',
      question: 'What was the first music video played on MTV?',
      option_a: 'Thriller',
      option_b: 'Video Killed the Radio Star',
      option_c: 'Take On Me',
      option_d: 'Sweet Dreams',
      correct_answer: 'B',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],

  movies: [
    {
      id: 'movies_1',
      category: 'movies',
      question: 'What is the highest-grossing film of all time (unadjusted)?',
      option_a: 'Titanic',
      option_b: 'Avengers: Endgame',
      option_c: 'Avatar',
      option_d: 'Star Wars: The Force Awakens',
      correct_answer: 'C',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'movies_2',
      category: 'movies',
      question: 'Who directed "Jurassic Park"?',
      option_a: 'James Cameron',
      option_b: 'Steven Spielberg',
      option_c: 'George Lucas',
      option_d: 'Ridley Scott',
      correct_answer: 'B',
      difficulty: 'easy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'movies_3',
      category: 'movies',
      question: 'In "The Matrix", what color pill does Neo take?',
      option_a: 'Blue',
      option_b: 'Green',
      option_c: 'Red',
      option_d: 'Yellow',
      correct_answer: 'C',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'movies_4',
      category: 'movies',
      question: 'What year was the first "Star Wars" movie released?',
      option_a: '1975',
      option_b: '1977',
      option_c: '1979',
      option_d: '1980',
      correct_answer: 'B',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'movies_5',
      category: 'movies',
      question: 'Which film won the Academy Award for Best Picture in 1994?',
      option_a: 'Pulp Fiction',
      option_b: 'The Shawshank Redemption',
      option_c: 'Forrest Gump',
      option_d: 'The Lion King',
      correct_answer: 'C',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'movies_6',
      category: 'movies',
      question: 'What is the name of the fictional African country in "Black Panther"?',
      option_a: 'Zamunda',
      option_b: 'Wakanda',
      option_c: 'Genovia',
      option_d: 'Latveria',
      correct_answer: 'B',
      difficulty: 'hard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};
// Function to get random questions for a category
export const getRandomQuestionsForCategory = (category: string, count: number = 10): TriviaQuestion[] => {
  const categoryQuestions = gamingTriviaQuestions[category] || [];
  
  if (categoryQuestions.length === 0) {
    console.warn(`No questions found for category: ${category}`);
    return [];
  }

  // If we have fewer questions than requested, duplicate and shuffle
  const availableQuestions = [...categoryQuestions];
  const selectedQuestions: TriviaQuestion[] = [];

  // First, add all available questions
  selectedQuestions.push(...availableQuestions);

  // If we need more questions, duplicate some randomly
  while (selectedQuestions.length < count && categoryQuestions.length > 0) {
    const randomIndex = Math.floor(Math.random() * categoryQuestions.length);
    const duplicatedQuestion = {
      ...categoryQuestions[randomIndex],
      id: `${categoryQuestions[randomIndex].id}_dup_${selectedQuestions.length}`
    };
    selectedQuestions.push(duplicatedQuestion);
  }

  // Shuffle the questions and return the requested count
  const shuffled = selectedQuestions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Function to get all questions for a category
export const getAllQuestionsForCategory = (category: string): TriviaQuestion[] => {
  return gamingTriviaQuestions[category] || [];
};

// Function to get a random mix of difficulties
export const getRandomMixedQuestions = (category: string, count: number = 10): TriviaQuestion[] => {
  const categoryQuestions = gamingTriviaQuestions[category] || [];
  
  if (categoryQuestions.length === 0) {
    return [];
  }

  // Separate questions by difficulty
  const easy = categoryQuestions.filter(q => q.difficulty === 'easy');
  const medium = categoryQuestions.filter(q => q.difficulty === 'medium');
  const hard = categoryQuestions.filter(q => q.difficulty === 'hard');

  const selectedQuestions: TriviaQuestion[] = [];

  // Try to get a good mix: 40% easy, 40% medium, 20% hard
  const easyCount = Math.floor(count * 0.4);
  const mediumCount = Math.floor(count * 0.4);
  const hardCount = count - easyCount - mediumCount;

  // Add easy questions
  for (let i = 0; i < easyCount && easy.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * easy.length);
    selectedQuestions.push(easy.splice(randomIndex, 1)[0]);
  }

  // Add medium questions
  for (let i = 0; i < mediumCount && medium.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * medium.length);
    selectedQuestions.push(medium.splice(randomIndex, 1)[0]);
  }

  // Add hard questions
  for (let i = 0; i < hardCount && hard.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * hard.length);
    selectedQuestions.push(hard.splice(randomIndex, 1)[0]);
  }

  // If we still need more questions, add from remaining
  const remaining = [...easy, ...medium, ...hard];
  while (selectedQuestions.length < count && remaining.length > 0) {
    const randomIndex = Math.floor(Math.random() * remaining.length);
    selectedQuestions.push(remaining.splice(randomIndex, 1)[0]);
  }

  // Shuffle the final selection
  return selectedQuestions.sort(() => Math.random() - 0.5);
};
