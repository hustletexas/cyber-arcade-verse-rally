
export interface Dao {
  authority: string;
  cctrMint: string;
  votingThreshold: number;
  minProposalTokens: number;
  votingPeriod: number;
  proposalCount: number;
  bump: number;
}

export interface Proposal {
  dao: string;
  proposer: string;
  title: string;
  description: string;
  proposalType: ProposalType;
  votesFor: number;
  votesAgainst: number;
  createdAt: number;
  votingEndsAt: number;
  executed: boolean;
  proposalId: number;
  bump: number;
}

export interface Vote {
  proposal: string;
  voter: string;
  support: boolean;
  tokenAmount: number;
  timestamp: number;
}

export type ProposalType = 
  | { parameter: { newVotingThreshold?: number; newMinProposalTokens?: number } }
  | { treasury: { recipient: string; amount: number } }
  | { governance: { newAuthority: string } };

export interface CreateProposalParams {
  title: string;
  description: string;
  proposalType: ProposalType;
}

export interface VoteParams {
  proposalId: number;
  support: boolean;
  tokenAmount: number;
}
