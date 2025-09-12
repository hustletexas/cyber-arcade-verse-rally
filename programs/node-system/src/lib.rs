use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("7WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWN");

#[program]
pub mod node_system {
    use super::*;

    pub fn initialize_node_system(ctx: Context<InitializeNodeSystem>) -> Result<()> {
        let node_system = &mut ctx.accounts.node_system;
        node_system.admin = ctx.accounts.admin.key();
        node_system.total_nodes_minted = 0;
        node_system.total_rewards_distributed = 0;
        node_system.bump = ctx.bumps.node_system;
        Ok(())
    }

    pub fn purchase_node(
        ctx: Context<PurchaseNode>,
        node_type: u8,
        amount: u64,
    ) -> Result<()> {
        let node_system = &mut ctx.accounts.node_system;
        let user_node_account = &mut ctx.accounts.user_node_account;
        
        // Validate node type (0=Basic, 1=Premium, 2=Legendary)
        require!(node_type <= 2, NodeError::InvalidNodeType);
        
        let (price, max_supply, daily_reward) = match node_type {
            0 => (1_000_000_000, 1000, 50_000_000), // Basic: 1 SOL, 1000 max, 0.05 SOL daily
            1 => (5_000_000_000, 500, 300_000_000), // Premium: 5 SOL, 500 max, 0.3 SOL daily
            2 => (10_000_000_000, 100, 700_000_000), // Legendary: 10 SOL, 100 max, 0.7 SOL daily
            _ => return Err(NodeError::InvalidNodeType.into()),
        };

        // Check if user already has a node account
        if user_node_account.owner == Pubkey::default() {
            user_node_account.owner = ctx.accounts.user.key();
            user_node_account.basic_nodes = 0;
            user_node_account.premium_nodes = 0;
            user_node_account.legendary_nodes = 0;
            user_node_account.last_claim_time = Clock::get()?.unix_timestamp;
            user_node_account.total_claimed = 0;
            user_node_account.bump = ctx.bumps.user_node_account;
        }

        // Check supply limits
        let current_supply = match node_type {
            0 => node_system.basic_nodes_minted,
            1 => node_system.premium_nodes_minted,
            2 => node_system.legendary_nodes_minted,
            _ => 0,
        };
        require!(current_supply < max_supply, NodeError::NodeSoldOut);

        // Transfer SOL payment
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.node_system.key(),
            price,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.node_system.to_account_info(),
            ],
        )?;

        // Update node counts
        match node_type {
            0 => {
                user_node_account.basic_nodes += 1;
                node_system.basic_nodes_minted += 1;
            },
            1 => {
                user_node_account.premium_nodes += 1;
                node_system.premium_nodes_minted += 1;
            },
            2 => {
                user_node_account.legendary_nodes += 1;
                node_system.legendary_nodes_minted += 1;
            },
            _ => {}
        }

        node_system.total_nodes_minted += 1;

        emit!(NodePurchased {
            user: ctx.accounts.user.key(),
            node_type,
            price,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let user_node_account = &mut ctx.accounts.user_node_account;
        let node_system = &mut ctx.accounts.node_system;
        let current_time = Clock::get()?.unix_timestamp;
        
        // Calculate time since last claim
        let time_diff = current_time - user_node_account.last_claim_time;
        require!(time_diff >= 86400, NodeError::ClaimTooEarly); // 24 hours = 86400 seconds

        // Calculate daily rewards
        let daily_rewards = 
            (user_node_account.basic_nodes as u64 * 50_000_000) +     // 0.05 SOL per basic node
            (user_node_account.premium_nodes as u64 * 300_000_000) +  // 0.3 SOL per premium node
            (user_node_account.legendary_nodes as u64 * 700_000_000); // 0.7 SOL per legendary node

        require!(daily_rewards > 0, NodeError::NoNodesToClaim);

        // Calculate total claimable (days passed * daily rewards)
        let days_passed = time_diff / 86400;
        let total_claimable = daily_rewards * days_passed as u64;

        // Transfer rewards from node system to user
        **ctx.accounts.node_system.to_account_info().try_borrow_mut_lamports()? -= total_claimable;
        **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += total_claimable;

        // Update user account
        user_node_account.last_claim_time = current_time;
        user_node_account.total_claimed += total_claimable;
        node_system.total_rewards_distributed += total_claimable;

        emit!(RewardsClaimed {
            user: ctx.accounts.user.key(),
            amount: total_claimable,
            timestamp: current_time,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeNodeSystem<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + NodeSystem::INIT_SPACE,
        seeds = [b"node_system"],
        bump
    )]
    pub node_system: Account<'info, NodeSystem>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PurchaseNode<'info> {
    #[account(
        mut,
        seeds = [b"node_system"],
        bump = node_system.bump
    )]
    pub node_system: Account<'info, NodeSystem>,
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserNodeAccount::INIT_SPACE,
        seeds = [b"user_nodes", user.key().as_ref()],
        bump
    )]
    pub user_node_account: Account<'info, UserNodeAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(
        mut,
        seeds = [b"node_system"],
        bump = node_system.bump
    )]
    pub node_system: Account<'info, NodeSystem>,
    #[account(
        mut,
        seeds = [b"user_nodes", user.key().as_ref()],
        bump = user_node_account.bump,
        has_one = owner @ NodeError::UnauthorizedOwner
    )]
    pub user_node_account: Account<'info, UserNodeAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: This is the owner field in user_node_account
    pub owner: UncheckedAccount<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct NodeSystem {
    pub admin: Pubkey,
    pub total_nodes_minted: u64,
    pub basic_nodes_minted: u64,
    pub premium_nodes_minted: u64,
    pub legendary_nodes_minted: u64,
    pub total_rewards_distributed: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct UserNodeAccount {
    pub owner: Pubkey,
    pub basic_nodes: u32,
    pub premium_nodes: u32,
    pub legendary_nodes: u32,
    pub last_claim_time: i64,
    pub total_claimed: u64,
    pub bump: u8,
}

#[event]
pub struct NodePurchased {
    pub user: Pubkey,
    pub node_type: u8,
    pub price: u64,
    pub timestamp: i64,
}

#[event]
pub struct RewardsClaimed {
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum NodeError {
    #[msg("Invalid node type")]
    InvalidNodeType,
    #[msg("Node type is sold out")]
    NodeSoldOut,
    #[msg("Cannot claim rewards yet, wait 24 hours")]
    ClaimTooEarly,
    #[msg("No nodes to claim rewards for")]
    NoNodesToClaim,
    #[msg("Unauthorized owner")]
    UnauthorizedOwner,
}