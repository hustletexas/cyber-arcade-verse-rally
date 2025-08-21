import { useEffect, useRef } from 'react';
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

  const getWalletEmail = (walletAddress: string) =>
    `${walletAddress.toLowerCase().slice(0, 8)}.wallet@cybercity.app`;

  const safeResetAuthFlag = () => {
    authInProgressRef.current = false;
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

    // Guard: avoid re-entrancy and spamming signup within 60s
    if (authInProgressRef.current) {
      console.log('[WalletAuth] Auth already in progress, skipping.');
      return;
    }
    const cooldownKey = `wallet-auth-cooldown:${walletAddress}`;
    const last = localStorage.getItem(cooldownKey);
    const now = Date.now();
    if (last && now - Number(last) < 60_000) {
      console.log('[WalletAuth] Cooldown active, skipping signup attempt.');
      // Still try a sign-in in case account exists now
      const { signInError } = await signInWithWalletCreds(walletAddress);
      if (!signInError) {
        toast({ title: "Welcome back!", description: "Logged in with your connected wallet" });
      }
      return;
    }

    authInProgressRef.current = true;
    lastAttemptedAddressRef.current = walletAddress;

    try {
      // First try a direct sign-in with deterministic wallet creds
      const { signInError } = await signInWithWalletCreds(walletAddress);

      if (!signInError) {
        toast({
          title: "Welcome back!",
          description: "Logged in with your connected wallet",
        });
        return;
      }

      // If that fails, create the account
      const walletEmail = getWalletEmail(walletAddress);
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
        // Store cooldown if rate limited
        if ((signUpError as any)?.status === 429) {
          localStorage.setItem(cooldownKey, String(now));
          toast({
            title: "Please wait a moment",
            description: "We're handling your wallet sign-in. Try again in about a minute.",
          });
          return;
        }
        // If already registered, try sign-in again
        if (signUpError.message?.toLowerCase().includes('already registered')) {
          const retry = await signInWithWalletCreds(walletAddress);
          if (!retry.signInError) {
            toast({
              title: "Welcome back!",
              description: "Logged in with your connected wallet",
            });
            return;
          }
        }
        toast({
          title: "Authentication Error",
          description: signUpError.message || "Failed to create wallet account",
          variant: "destructive",
        });
        return;
      }

      // Attempt immediate sign-in after sign-up (works if email confirmations are disabled)
      const retry = await signInWithWalletCreds(walletAddress);
      if (!retry.signInError) {
        toast({
          title: "Account Created!",
          description: "Successfully created and logged into your wallet account",
        });
        return;
      }

      // If sign-in still fails, likely email confirmation is required
      toast({
        title: "Check your email",
        description: "Please confirm your email to complete wallet sign-in.",
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

  // Auto-login when wallet connects and no user is logged in, with guard against duplicate attempts
  useEffect(() => {
    const addr = primaryWallet?.address;
    if (addr && !user && isWalletConnected) {
      if (lastAttemptedAddressRef.current === addr || authInProgressRef.current) {
        return;
      }
      console.log('Auto-authenticating with wallet:', addr);
      createOrLoginWithWallet(addr);
    }
  }, [primaryWallet?.address, user, isWalletConnected]); // only re-run if address changes

  return {
    createOrLoginWithWallet,
    createWalletAccount,
    logoutWallet
  };
};
