
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VotingDao } from "../target/types/voting_dao";
import { expect } from "chai";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";

describe("voting-dao", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.VotingDao as Program<VotingDao>;
  const authority = provider.wallet as anchor.Wallet;
  
  let cctrMint: anchor.web3.PublicKey;
  let daoAddress: anchor.web3.PublicKey;
  let proposalAddress: anchor.web3.PublicKey;
  let voterTokenAccount: anchor.web3.PublicKey;

  before(async () => {
    // Create CCTR token mint
    cctrMint = await createMint(
      provider.connection,
      authority.payer,
      authority.publicKey,
      null,
      6
    );

    // Find DAO PDA
    [daoAddress] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("dao")],
      program.programId
    );

    // Create voter token account
    voterTokenAccount = await createAccount(
      provider.connection,
      authority.payer,
      cctrMint,
      authority.publicKey
    );

    // Mint tokens to voter
    await mintTo(
      provider.connection,
      authority.payer,
      cctrMint,
      voterTokenAccount,
      authority.publicKey,
      1000000 * 10**6 // 1M tokens
    );
  });

  it("Initializes the DAO", async () => {
    await program.methods
      .initializeDao(
        new anchor.BN(100000), // voting threshold
        new anchor.BN(1000),   // min proposal tokens
        new anchor.BN(86400 * 7) // 7 days voting period
      )
      .accounts({
        dao: daoAddress,
        authority: authority.publicKey,
        cctrMint: cctrMint,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const dao = await program.account.dao.fetch(daoAddress);
    expect(dao.authority.toString()).to.equal(authority.publicKey.toString());
    expect(dao.proposalCount.toNumber()).to.equal(0);
  });

  it("Creates a proposal", async () => {
    const dao = await program.account.dao.fetch(daoAddress);
    
    [proposalAddress] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("proposal"),
        daoAddress.toBuffer(),
        dao.proposalCount.toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );

    await program.methods
      .createProposal(
        "Test Proposal",
        "This is a test proposal for the DAO",
        {
          parameter: {
            newVotingThreshold: new anchor.BN(200000),
            newMinProposalTokens: null,
          }
        }
      )
      .accounts({
        dao: daoAddress,
        proposal: proposalAddress,
        proposer: authority.publicKey,
        proposerTokenAccount: voterTokenAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const proposal = await program.account.proposal.fetch(proposalAddress);
    expect(proposal.title).to.equal("Test Proposal");
    expect(proposal.proposer.toString()).to.equal(authority.publicKey.toString());
  });

  it("Casts a vote", async () => {
    const [voteAddress] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("vote"),
        proposalAddress.toBuffer(),
        authority.publicKey.toBuffer()
      ],
      program.programId
    );

    // Create vote escrow account
    const voteEscrow = await createAccount(
      provider.connection,
      authority.payer,
      cctrMint,
      authority.publicKey
    );

    await program.methods
      .castVote(true, new anchor.BN(50000)) // Vote with 50k tokens
      .accounts({
        proposal: proposalAddress,
        vote: voteAddress,
        voter: authority.publicKey,
        voterTokenAccount: voterTokenAccount,
        voteEscrow: voteEscrow,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const vote = await program.account.vote.fetch(voteAddress);
    expect(vote.support).to.be.true;
    expect(vote.tokenAmount.toNumber()).to.equal(50000);

    const proposal = await program.account.proposal.fetch(proposalAddress);
    expect(proposal.votesFor.toNumber()).to.equal(50000);
  });
});
