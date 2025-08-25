
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint, MintTo};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("AvatarMetaverse11111111111111111111111111111");

#[program]
pub mod avatar_metaverse {
    use super::*;

    pub fn initialize_metaverse(
        ctx: Context<InitializeMetaverse>,
        creation_fee: u64,
        max_supply: u64,
    ) -> Result<()> {
        let metaverse = &mut ctx.accounts.metaverse;
        metaverse.authority = ctx.accounts.authority.key();
        metaverse.cctr_mint = ctx.accounts.cctr_mint.key();
        metaverse.creation_fee = creation_fee;
        metaverse.max_supply = max_supply;
        metaverse.total_avatars = 0;
        metaverse.bump = ctx.bumps.metaverse;
        
        msg!("Metaverse initialized with creation fee: {} CCTR", creation_fee);
        Ok(())
    }

    pub fn create_avatar(
        ctx: Context<CreateAvatar>,
        name: String,
        attributes: AvatarAttributes,
        metadata_uri: String,
    ) -> Result<()> {
        let metaverse = &mut ctx.accounts.metaverse;
        let avatar = &mut ctx.accounts.avatar;

        require!(name.len() <= 50, MetaverseError::NameTooLong);
        require!(metadata_uri.len() <= 200, MetaverseError::UriTooLong);
        require!(
            metaverse.total_avatars < metaverse.max_supply,
            MetaverseError::MaxSupplyReached
        );

        // Check user has enough CCTR tokens
        require!(
            ctx.accounts.user_cctr_account.amount >= metaverse.creation_fee,
            MetaverseError::InsufficientTokens
        );

        // Transfer CCTR tokens as creation fee
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_cctr_account.to_account_info(),
                to: ctx.accounts.fee_vault.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, metaverse.creation_fee)?;

        // Mint avatar NFT
        let metaverse_seeds = &[b"metaverse".as_ref(), &[metaverse.bump]];
        let signer = &[&metaverse_seeds[..]];
        
        let mint_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.avatar_mint.to_account_info(),
                to: ctx.accounts.avatar_token_account.to_account_info(),
                authority: metaverse.to_account_info(),
            },
            signer,
        );
        token::mint_to(mint_ctx, 1)?;

        let clock = Clock::get()?;
        
        avatar.metaverse = metaverse.key();
        avatar.owner = ctx.accounts.owner.key();
        avatar.mint = ctx.accounts.avatar_mint.key();
        avatar.name = name;
        avatar.attributes = attributes;
        avatar.metadata_uri = metadata_uri;
        avatar.created_at = clock.unix_timestamp;
        avatar.last_updated = clock.unix_timestamp;
        avatar.avatar_id = metaverse.total_avatars;
        avatar.bump = ctx.bumps.avatar;

        metaverse.total_avatars += 1;

        msg!("Avatar '{}' created with ID: {}", avatar.name, avatar.avatar_id);
        Ok(())
    }

    pub fn update_avatar(
        ctx: Context<UpdateAvatar>,
        new_attributes: Option<AvatarAttributes>,
        new_metadata_uri: Option<String>,
    ) -> Result<()> {
        let avatar = &mut ctx.accounts.avatar;
        let clock = Clock::get()?;

        if let Some(attributes) = new_attributes {
            avatar.attributes = attributes;
        }

        if let Some(uri) = new_metadata_uri {
            require!(uri.len() <= 200, MetaverseError::UriTooLong);
            avatar.metadata_uri = uri;
        }

        avatar.last_updated = clock.unix_timestamp;

        msg!("Avatar '{}' updated", avatar.name);
        Ok(())
    }

    pub fn transfer_avatar(ctx: Context<TransferAvatar>) -> Result<()> {
        let avatar = &mut ctx.accounts.avatar;
        
        // Transfer the NFT
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.from_token_account.to_account_info(),
                to: ctx.accounts.to_token_account.to_account_info(),
                authority: ctx.accounts.current_owner.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, 1)?;

        // Update avatar owner
        avatar.owner = ctx.accounts.new_owner.key();
        avatar.last_updated = Clock::get()?.unix_timestamp;

        msg!("Avatar '{}' transferred to new owner", avatar.name);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeMetaverse<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Metaverse::LEN,
        seeds = [b"metaverse"],
        bump
    )]
    pub metaverse: Account<'info, Metaverse>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: CCTR token mint
    pub cctr_mint: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateAvatar<'info> {
    #[account(mut)]
    pub metaverse: Account<'info, Metaverse>,
    
    #[account(
        init,
        payer = owner,
        space = 8 + Avatar::LEN,
        seeds = [b"avatar", metaverse.key().as_ref(), &metaverse.total_avatars.to_le_bytes()],
        bump
    )]
    pub avatar: Account<'info, Avatar>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        init,
        payer = owner,
        mint::decimals = 0,
        mint::authority = metaverse,
    )]
    pub avatar_mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = owner,
        associated_token::mint = avatar_mint,
        associated_token::authority = owner,
    )]
    pub avatar_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = user_cctr_account.mint == metaverse.cctr_mint
    )]
    pub user_cctr_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub fee_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UpdateAvatar<'info> {
    #[account(
        mut,
        constraint = avatar.owner == owner.key()
    )]
    pub avatar: Account<'info, Avatar>,
    
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct TransferAvatar<'info> {
    #[account(
        mut,
        constraint = avatar.owner == current_owner.key()
    )]
    pub avatar: Account<'info, Avatar>,
    
    pub current_owner: Signer<'info>,
    
    /// CHECK: New owner account
    pub new_owner: AccountInfo<'info>,
    
    #[account(mut)]
    pub from_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub to_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Metaverse {
    pub authority: Pubkey,
    pub cctr_mint: Pubkey,
    pub creation_fee: u64,
    pub max_supply: u64,
    pub total_avatars: u64,
    pub bump: u8,
}

impl Metaverse {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 8 + 1;
}

#[account]
pub struct Avatar {
    pub metaverse: Pubkey,
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub name: String,
    pub attributes: AvatarAttributes,
    pub metadata_uri: String,
    pub created_at: i64,
    pub last_updated: i64,
    pub avatar_id: u64,
    pub bump: u8,
}

impl Avatar {
    pub const LEN: usize = 32 + 32 + 32 + 50 + AvatarAttributes::LEN + 200 + 8 + 8 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AvatarAttributes {
    pub skin_color: String,
    pub hair_style: String,
    pub hair_color: String,
    pub eye_color: String,
    pub clothing_top: String,
    pub clothing_bottom: String,
    pub accessories: Vec<String>,
    pub background: String,
}

impl AvatarAttributes {
    pub const LEN: usize = 20 + 20 + 20 + 20 + 20 + 20 + 100 + 20; // Approximate
}

#[error_code]
pub enum MetaverseError {
    #[msg("Avatar name too long (max 50 characters)")]
    NameTooLong,
    #[msg("Metadata URI too long (max 200 characters)")]
    UriTooLong,
    #[msg("Maximum supply of avatars reached")]
    MaxSupplyReached,
    #[msg("Insufficient CCTR tokens")]
    InsufficientTokens,
    #[msg("Unauthorized access")]
    Unauthorized,
}
