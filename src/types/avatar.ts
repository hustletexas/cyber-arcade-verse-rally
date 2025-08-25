
export interface AvatarAttributes {
  skinColor: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  clothingTop: string;
  clothingBottom: string;
  accessories: string[];
  background: string;
}

export interface Avatar {
  metaverse: string;
  owner: string;
  mint: string;
  name: string;
  attributes: AvatarAttributes;
  metadataUri: string;
  createdAt: number;
  lastUpdated: number;
  avatarId: number;
  bump: number;
}

export interface Metaverse {
  authority: string;
  cctrMint: string;
  creationFee: number;
  maxSupply: number;
  totalAvatars: number;
  bump: number;
}

export interface CreateAvatarParams {
  name: string;
  attributes: AvatarAttributes;
  metadataUri?: string;
}
