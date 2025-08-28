
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useWalletAuth = () => {
  const { user } = useAuth();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { toast } = useToast();

  // Prevent duplicate/parallel auth attempts and rate-limit thrashing
  const authInProgressRef = useRef(false);
  const lastAttemptedAddressRef = useRef<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const getWalletEmail = (walletAddress: string) =>
    `${walletAddress.toLowerCase().slice(0, 8)}.wallet@cybercity.app`;

  const safeResetAuthFlag = () => {
    authInProgressRef.current = false;
    setIsAuthenticating(false);
  };

  const signInWithWalletCreds = async (walletAddress: string) => {
    const walletEmail = getWalletEmail(walletAddress);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: walletEmail,
      password: walletAddress,
    });
    return { signInError };
  };

  const createOrLoginWithWallet = async (walletAddress: string) => {
    if (!walletAddress) return;

    // Guard: avoid re-entrancy and spamming signup
    if (authInProgressRef.current) {
      console.log('[WalletAuth] Auth already in progress, skipping.');
      return;
    }

    // Enhanced cooldown check - longer cooldown for email confirmation scenarios
    const cooldownKey = `wallet-auth-cooldown:${walletAddress}`;
    const emailConfirmKey = `wallet-email-confirm:${walletAddress}`;
    const last = localStorage.getItem(cooldownKey);
    const emailConfirmTime = localStorage.getItem(emailConfirmKey);
    const now = Date.now();
    const walletEmail = getWalletEmail(walletAddress);

    // If we're in email confirmation state, use longer cooldown
    if (emailConfirmTime && now - Number(emailConfirmTime) < 300_000) { // 5 minutes
      console.log('[WalletAuth] Email confirmation pending, skipping auto-auth.');
      return;
    }

    // Regular cooldown check
    if (last && now - Number(last) < 60_000) {
      console.log('[WalletAuth] Cooldown active, attempting sign-in only.');
      const { signInError } = await signInWithWalletCreds(walletAddress);
      if (!signInError) {
        // Clear email confirmation state on successful login
        localStorage.removeItem(emailConfirmKey);
        toast({ title: "Welcome back!", description: "Logged in with your connected wallet" });
      } else if (signInError.message?.includes('email_not_confirmed')) {
        // Set email confirmation state
        localStorage.setItem(emailConfirmKey, String(now));
        toast({
          title: "Please check your email",
          description: `Confirm your email (${walletEmail}) to complete wallet sign-in.`,
        });
      }
      return;
    }

    authInProgressRef.current = true;
    setIsAuthenticating(true);
    lastAttemptedAddressRef.current = walletAddress;

    try {
      // First try a direct sign-in with deterministic wallet creds
      const { signInError } = await signInWithWalletCreds(walletAddress);

      if (!signInError) {
        // Clear any email confirmation state
        localStorage.removeItem(emailConfirmKey);
        toast({
          title: "Welcome back!",
          description: "Logged in with your connected wallet",
        });
        return;
      }

      // If email not confirmed, don't create a new account
      if (signInError.message?.includes('email_not_confirmed')) {
        localStorage.setItem(emailConfirmKey, String(now));
        toast({
          title: "Please check your email",
          description: `Confirm your email (${walletEmail}) to complete wallet sign-in.`,
        });
        return;
      }

      // Only create account if it's a genuine "not found" error
      if (!signInError.message?.includes('Invalid login credentials')) {
        console.error('Unexpected sign-in error:', signInError);
        toast({
          title: "Authentication Error",
          description: signInError.message || "Failed to authenticate with wallet",
          variant: "destructive",
        });
        return;
      }

      // Set cooldown to avoid 429 thrashing on sign-up bursts
      localStorage.setItem(cooldownKey, String(now));

      // Create the account
      const { error: signUpError } = await supabase.auth.signUp({
        email: walletEmail,
        password: walletAddress,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: `Wallet_${walletAddress.slice(0, 6)}`,
            wallet_address: walletAddress,
          },
        },
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        // If rate limited, extend cooldown and inform user
        if ((signUpError as any)?.status === 429) {
          localStorage.setItem(cooldownKey, String(now));
          toast({
            title: "Please wait a moment",
            description: `We're setting up your wallet login. Try again in about a minute.`,
          });
          return;
        }
        // If already registered, the email confirmation is likely pending
        if (signUpError.message?.toLowerCase().includes('already registered')) {
          localStorage.setItem(emailConfirmKey, String(now));
          toast({
            title: "Check your email",
            description: `Please confirm your email (${walletEmail}) to complete wallet sign-in.`,
          });
          return;
        }
        toast({
          title: "Authentication Error",
          description: signUpError.message || "Failed to create wallet account",
          variant: "destructive",
        });
        return;
      }

      // Account created successfully, set email confirmation state
      localStorage.setItem(emailConfirmKey, String(now));
      toast({
        title: "Check your email",
        description: `Please confirm your email (${walletEmail}) to complete wallet sign-in.`,
      });

    } catch (error: any) {
      console.error('Error in wallet authentication:', error);
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to authenticate with wallet",
        variant: "destructive",
      });
    } finally {
      safeResetAuthFlag();
    }
  };

  const createWalletAccount = async (walletAddress: string) => {
    // Delegate to createOrLogin to keep logic in one place
    await createOrLoginWithWallet(walletAddress);
  };

  const logoutWallet = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: "Logout Error",
          description: "Failed to logout completely",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Logged Out",
          description: "Successfully logged out from your wallet account",
        });
      }
    } catch (error: any) {
      console.error('Wallet logout error:', error);
      toast({
        title: "Logout Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    }
  };

  // Auto-login when wallet connects and no user is logged in, with enhanced guard against duplicate attempts
  useEffect(() => {
    const addr = primaryWallet?.address;
    
    // Only proceed if we have a wallet address, no current user, wallet is connected, and we're not already processing this address
    if (addr && !user && isWalletConnected && lastAttemptedAddressRef.current !== addr && !authInProgressRef.current) {
      console.log('Auto-authenticating with wallet:', addr);
      createOrLoginWithWallet(addr);
    }
  }, [primaryWallet?.address, user, isWalletConnected]); // Stable dependencies

  return {
    createOrLoginWithWallet,
    createWalletAccount,
    logoutWallet,
    isAuthenticating
  };
};
