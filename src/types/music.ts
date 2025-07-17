
export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  genre: string;
  artwork?: string;
  nft?: NFTMetadata;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
}

export interface NFTMetadata {
  mintAddress: string;
  price: number;
  tokenId: string;
  collection: string;
  creator: string;
  royalties: number;
  isForSale: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
  likes: number;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  artwork?: string;
  description?: string;
}
