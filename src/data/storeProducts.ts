export interface MerchandiseItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'shirt' | 'hoodie' | 'jacket' | 'sticker' | 'mousepad' | 'hat' | 'jersey' | 'shorts';
  sizes: string[];
  colors: string[];
  description: string;
  isLimited?: boolean;
}

export const merchandiseItems: MerchandiseItem[] = [
  {
    id: '1',
    name: 'Cyber City Arcade Retro Gaming Tee',
    price: 29.99,
    image: '/images/store/cyber-city-arcade-tee.png',
    category: 'shirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Navy', 'Charcoal'],
    description: 'Premium cotton tee featuring the iconic Cyber City Arcade cabinet with neon cityscape design'
  },
  {
    id: '2',
    name: 'Cyber City Arcade Premium Hoodie',
    price: 49.99,
    image: '/images/store/cyber-city-arcade-hoodie.png',
    category: 'hoodie',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Dark Gray', 'Navy'],
    description: 'Premium hoodie featuring the complete Cyber City Arcade design with neon cityscape and retro arcade cabinet'
  },
  {
    id: '20',
    name: 'Cyber City Arcade Neon Hoodie',
    price: 54.99,
    image: '/images/store/cyber-city-neon-hoodie.png',
    category: 'hoodie',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black'],
    description: 'Premium pullover hoodie with neon Cyber City skyline, LED-accent piping, galaxy hood lining, and Stellar Blockchain badge',
    isLimited: true
  },
  {
    id: '3',
    name: 'Cyber City Arcade Bomber Jacket',
    price: 89.99,
    image: '/images/store/cyber-city-bomber-jacket-v2.png',
    category: 'jacket',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black'],
    description: 'Premium bomber jacket featuring the complete Cyber City Arcade design with neon cityscape',
    isLimited: true
  },
  {
    id: '13',
    name: 'Cyber City Arcade RGB Mousepad',
    price: 19.99,
    image: '/images/store/cyber-city-mousepad.png',
    category: 'mousepad',
    sizes: ['One Size'],
    colors: ['Black'],
    description: 'Extended RGB gaming mousepad featuring the iconic Cyber City Arcade design with neon LED edge lighting'
  },
  {
    id: '14',
    name: 'Cyber City Arcade Track Jacket',
    price: 89.99,
    image: '/images/store/cyber-city-track-jacket.png',
    category: 'jacket',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black'],
    description: 'Premium track jacket with Stellar Blockchain badge, neon piping, and Cyber City skyline design'
  },
  {
    id: '15',
    name: 'Cyber City Arcade Snapback',
    price: 29.99,
    image: '/images/store/cyber-city-hat.png',
    category: 'hat',
    sizes: ['One Size'],
    colors: ['Black'],
    description: 'Premium snapback cap with neon Cyber City Arcade logo and Stellar Blockchain badge'
  },
  {
    id: '16',
    name: 'Cyber City Arcade Pom Beanie',
    price: 24.99,
    image: '/images/store/cyber-city-beanie.png',
    category: 'hat',
    sizes: ['One Size'],
    colors: ['Black'],
    description: 'Cozy knit beanie with neon Cyber City Arcade skyline patch and purple pom-pom'
  },
  {
    id: '17',
    name: 'Cyber City Arcade Bucket Hat',
    price: 27.99,
    image: '/images/store/cyber-city-bucket-hat.png',
    category: 'hat',
    sizes: ['One Size'],
    colors: ['Black'],
    description: 'Stylish bucket hat with neon Cyber City Arcade skyline print and LED-accent brim'
  },
  {
    id: '18',
    name: 'Cyber City Arcade Hustle Jersey',
    price: 44.99,
    image: '/images/store/cyber-city-jersey.png',
    category: 'jersey',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black'],
    description: 'Premium esports jersey with neon Cyber City skyline, #01 HUSTLE back print, and Stellar Blockchain badge',
    isLimited: true
  },
  {
    id: '19',
    name: 'Cyber City Arcade Shorts',
    price: 34.99,
    image: '/images/store/cyber-city-shorts.png',
    category: 'shorts',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black'],
    description: 'Athletic mesh shorts with neon Cyber City skyline print, Stellar Blockchain badge, and drawstring waist'
  },
  {
    id: '10',
    name: 'Season 1 Sticker Pack - Classic',
    price: 12.99,
    image: '/images/store/sticker-pack-1.png',
    category: 'sticker',
    sizes: ['One Size'],
    colors: ['Multi'],
    description: 'Limited edition 20-piece sticker pack featuring iconic Cyber City Arcade designs'
  }
];
