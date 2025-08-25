
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM");

#[program]
pub mod voting_dao {
    use super::*;

    pub fn initialize_dao(
        ctx: Context<InitializeDao>,
        voting_threshold: u64,
        min_proposal_tokens: u64,
        voting_period: i64,
    ) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        dao.authority = ctx.accounts.authority.key();
        dao.cctr_mint = ctx.accounts.cctr_mint.key();
        dao.voting_threshold = voting_threshold;
        dao.min_proposal_tokens = min_proposal_tokens;
        dao.voting_period = voting_period;
        dao.proposal_count = 0;
        dao.bump = ctx.bumps.dao;
        
        msg!("DAO initialized with authority: {}", dao.authority);
        Ok(())
    }

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        proposal_type: ProposalType,
    ) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        let proposal = &mut ctx.accounts.proposal;
        let proposer_tokens = ctx.accounts.proposer_token_account.amount;

        require!(
            proposer_tokens >= dao.min_proposal_tokens,
            VotingError::InsufficientTokensToPropose
        );

        require!(title.len() <= 100, VotingError::TitleTooLong);
        require!(description.len() <= 500, VotingError::DescriptionTooLong);

        let clock = Clock::get()?;
        
        proposal.dao = dao.key();
        proposal.proposer = ctx.accounts.proposer.key();
        proposal.title = title;
        proposal.description = description;
        proposal.proposal_type = proposal_type;
        proposal.votes_for = 0;
        proposal.votes_against = 0;
        proposal.created_at = clock.unix_timestamp;
        proposal.voting_ends_at = clock.unix_timestamp + dao.voting_period;
        proposal.executed = false;
        proposal.proposal_id = dao.proposal_count;
        proposal.bump = ctx.bumps.proposal;

        dao.proposal_count += 1;

        msg!("Proposal created: {} by {}", proposal.title, proposal.proposer);
        Ok(())
    }

    pub fn cast_vote(
        ctx: Context<CastVote>,
        support: bool,
        token_amount: u64,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let vote = &mut ctx.accounts.vote;
        let voter_tokens = ctx.accounts.voter_token_account.amount;

        require!(token_amount > 0, VotingError::InvalidVoteAmount);
        require!(token_amount <= voter_tokens, VotingError::InsufficientTokens);

        let clock = Clock::get()?;
        require!(
            clock.unix_timestamp <= proposal.voting_ends_at,
            VotingError::VotingPeriodEnded
        );

        // Transfer tokens to escrow (lock them during voting)
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.voter_token_account.to_account_info(),
                to: ctx.accounts.vote_escrow.to_account_info(),
                authority: ctx.accounts.voter.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, token_amount)?;

        vote.proposal = proposal.key();
        vote.voter = ctx.accounts.voter.key();
        vote.support = support;
        vote.token_amount = token_amount;
        vote.timestamp = clock.unix_timestamp;

        if support {
            proposal.votes_for += token_amount;
        } else {
            proposal.votes_against += token_amount;
        }

        msg!("Vote cast: {} tokens {} proposal {}", 
             token_amount, 
             if support { "for" } else { "against" }, 
             proposal.proposal_id);
        Ok(())
    }

    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let dao = &ctx.accounts.dao;

        let clock = Clock::get()?;
        require!(
            clock.unix_timestamp > proposal.voting_ends_at,
            VotingError::VotingStillActive
        );

        require!(!proposal.executed, VotingError::ProposalAlreadyExecuted);

        let total_votes = proposal.votes_for + proposal.votes_against;
        require!(
            proposal.votes_for > proposal.votes_against &&
            total_votes >= dao.voting_threshold,
            VotingError::ProposalRejected
        );

        proposal.executed = true;

        // Execute based on proposal type
        match proposal.proposal_type {
            ProposalType::Parameter { new_voting_threshold, new_min_proposal_tokens } => {
                // This would require additional logic to update DAO parameters
                msg!("Parameter proposal executed");
            }
            ProposalType::Treasury { recipient, amount } => {
                // This would require treasury management logic
                msg!("Treasury proposal executed: {} tokens to {}", amount, recipient);
            }
            ProposalType::Governance { new_authority } => {
                // This would require authority transfer logic
                msg!("Governance proposal executed: new authority {}", new_authority);
            }
        }

        msg!("Proposal {} executed successfully", proposal.proposal_id);
        Ok(())
    }

    pub fn reclaim_tokens(ctx: Context<ReclaimTokens>) -> Result<()> {
        let proposal = &ctx.accounts.proposal;
        let vote = &ctx.accounts.vote;

        let clock = Clock::get()?;
        require!(
            clock.unix_timestamp > proposal.voting_ends_at,
            VotingError::VotingStillActive
        );

        // Transfer tokens back from escrow
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vote_escrow.to_account_info(),
                to: ctx.accounts.voter_token_account.to_account_info(),
                authority: ctx.accounts.vote_escrow.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, vote.token_amount)?;

        msg!("Tokens reclaimed: {} CCTR", vote.token_amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeDao<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Dao::LEN,
        seeds = [b"dao"],
        bump
    )]
    pub dao: Account<'info, Dao>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: This is the CCTR token mint
    pub cctr_mint: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(mut)]
    pub dao: Account<'info, Dao>,
    
    #[account(
        init,
        payer = proposer,
        space = 8 + Proposal::LEN,
        seeds = [b"proposal", dao.key().as_ref(), &dao.proposal_count.to_le_bytes()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    
    #[account(mut)]
    pub proposer: Signer<'info>,
    
    #[account(
        constraint = proposer_token_account.mint == dao.cctr_mint
    )]
    pub proposer_token_account: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    
    #[account(
        init,
        payer = voter,
        space = 8 + Vote::LEN,
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote: Account<'info, Vote>,
    
    #[account(mut)]
    pub voter: Signer<'info>,
    
    #[account(mut)]
    pub voter_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub vote_escrow: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    pub dao: Account<'info, Dao>,
    
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ReclaimTokens<'info> {
    pub proposal: Account<'info, Proposal>,
    pub vote: Account<'info, Vote>,
    
    #[account(mut)]
    pub voter: Signer<'info>,
    
    #[account(mut)]
    pub voter_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub vote_escrow: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Dao {
    pub authority: Pubkey,
    pub cctr_mint: Pubkey,
    pub voting_threshold: u64,
    pub min_proposal_tokens: u64,
    pub voting_period: i64,
    pub proposal_count: u64,
    pub bump: u8,
}

impl Dao {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 8 + 8 + 1;
}

#[account]
pub struct Proposal {
    pub dao: Pubkey,
    pub proposer: Pubkey,
    pub title: String,
    pub description: String,
    pub proposal_type: ProposalType,
    pub votes_for: u64,
    pub votes_against: u64,
    pub created_at: i64,
    pub voting_ends_at: i64,
    pub executed: bool,
    pub proposal_id: u64,
    pub bump: u8,
}

impl Proposal {
    pub const LEN: usize = 32 + 32 + 100 + 500 + 64 + 8 + 8 + 8 + 8 + 1 + 8 + 1;
}

#[account]
pub struct Vote {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub support: bool,
    pub token_amount: u64,
    pub timestamp: i64,
}

impl Vote {
    pub const LEN: usize = 32 + 32 + 1 + 8 + 8;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum ProposalType {
    Parameter {
        new_voting_threshold: Option<u64>,
        new_min_proposal_tokens: Option<u64>,
    },
    Treasury {
        recipient: Pubkey,
        amount: u64,
    },
    Governance {
        new_authority: Pubkey,
    },
}

#[error_code]
pub enum VotingError {
    #[msg("Insufficient tokens to create proposal")]
    InsufficientTokensToPropose,
    #[msg("Title too long (max 100 characters)")]
    TitleTooLong,
    #[msg("Description too long (max 500 characters)")]
    DescriptionTooLong,
    #[msg("Invalid vote amount")]
    InvalidVoteAmount,
    #[msg("Insufficient tokens to vote")]
    InsufficientTokens,
    #[msg("Voting period has ended")]
    VotingPeriodEnded,
    #[msg("Voting is still active")]
    VotingStillActive,
    #[msg("Proposal already executed")]
    ProposalAlreadyExecuted,
    #[msg("Proposal was rejected")]
    ProposalRejected,
}
