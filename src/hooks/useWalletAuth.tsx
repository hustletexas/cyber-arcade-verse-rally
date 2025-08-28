
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
  const [isSmartContractReady, setIsSmartContractReady] = useState(false);

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

  const initializeSmartContractConnection = async (walletAddress: string) => {
    try {
      // Check if wallet is still connected to the browser extension
      let isStillConnected = false;
      
      if (primaryWallet?.type === 'phantom' && window.solana?.isPhantom) {
        isStillConnected = window.solana.isConnected;
      } else if (primaryWallet?.type === 'solflare' && window.solflare?.isSolflare) {
        isStillConnected = window.solflare.isConnected;
      } else if (primaryWallet?.type === 'backpack' && window.backpack?.isBackpack) {
        isStillConnected = window.backpack.isConnected;
      } else if (primaryWallet?.type === 'coinbase' && window.ethereum?.isCoinbaseWallet) {
        // For Ethereum wallets, check if accounts are still available
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        isStillConnected = accounts && accounts.length > 0;
      }

      if (isStillConnected) {
        setIsSmartContractReady(true);
        console.log(`Smart contract connection ready for ${primaryWallet?.type} wallet`);
      } else {
        setIsSmartContractReady(false);
        console.log('Wallet disconnected from browser extension');
      }
    } catch (error) {
      console.error('Error checking smart contract connection:', error);
      setIsSmartContractReady(false);
    }
  };

  const createOrLoginWithWallet = async (walletAddress: string) => {
    if (!walletAddress) return;

    // Guard: avoid re-entrancy and spamming signup
    if (authInProgressRef.current) {
      console.log('[WalletAuth] Auth already in progress, skipping.');
      return;
    }

    // Enhanced cooldown check - shorter cooldown for better UX
    const cooldownKey = `wallet-auth-cooldown:${walletAddress}`;
    const emailConfirmKey = `wallet-email-confirm:${walletAddress}`;
    const last = localStorage.getItem(cooldownKey);
    const emailConfirmTime = localStorage.getItem(emailConfirmKey);
    const now = Date.now();
    const walletEmail = getWalletEmail(walletAddress);

    // If we're in email confirmation state, use longer cooldown
    if (emailConfirmTime && now - Number(emailConfirmTime) < 120_000) { // 2 minutes
      console.log('[WalletAuth] Email confirmation pending, attempting sign-in.');
      const { signInError } = await signInWithWalletCreds(walletAddress);
      if (!signInError) {
        localStorage.removeItem(emailConfirmKey);
        setIsAuthenticating(false);
        await initializeSmartContractConnection(walletAddress);
        toast({ 
          title: "Welcome back!", 
          description: "Wallet authenticated and smart contract ready" 
        });
      }
      return;
    }

    // Regular cooldown check - reduced to 30 seconds
    if (last && now - Number(last) < 30_000) {
      console.log('[WalletAuth] Quick retry - attempting sign-in only.');
      const { signInError } = await signInWithWalletCreds(walletAddress);
      if (!signInError) {
        localStorage.removeItem(emailConfirmKey);
        await initializeSmartContractConnection(walletAddress);
        toast({ 
          title: "Welcome back!", 
          description: "Wallet authenticated and smart contract ready" 
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
        await initializeSmartContractConnection(walletAddress);
        toast({
          title: "Welcome back!",
          description: "Wallet authenticated and smart contract ready",
        });
        return;
      }

      // If email not confirmed, don't create a new account
      if (signInError.message?.includes('email_not_confirmed')) {
        localStorage.setItem(emailConfirmKey, String(now));
        toast({
          title: "Check your email",
          description: `Confirm your email (${walletEmail}) to complete wallet authentication.`,
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

      // Set cooldown to avoid rate limiting
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
        if ((signUpError as any)?.status === 429) {
          localStorage.setItem(cooldownKey, String(now));
          toast({
            title: "Please wait",
            description: `Setting up wallet authentication. Try again in 30 seconds.`,
          });
          return;
        }
        if (signUpError.message?.toLowerCase().includes('already registered')) {
          localStorage.setItem(emailConfirmKey, String(now));
          toast({
            title: "Check your email",
            description: `Please confirm your email (${walletEmail}) to complete authentication.`,
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

      // Account created successfully
      localStorage.setItem(emailConfirmKey, String(now));
      toast({
        title: "Check your email",
        description: `Please confirm your email (${walletEmail}) to complete authentication.`,
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
    await createOrLoginWithWallet(walletAddress);
  };

  const logoutWallet = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setIsSmartContractReady(false);
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
          description: "Disconnected from wallet and smart contracts",
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

  // Auto-login when wallet connects and initialize smart contract connection
  useEffect(() => {
    const addr = primaryWallet?.address;
    
    if (addr && !user && isWalletConnected && lastAttemptedAddressRef.current !== addr && !authInProgressRef.current) {
      console.log('Auto-authenticating with wallet:', addr);
      createOrLoginWithWallet(addr);
    } else if (addr && user && isWalletConnected && !isSmartContractReady) {
      // User is already authenticated, just initialize smart contract connection
      initializeSmartContractConnection(addr);
    }
  }, [primaryWallet?.address, user, isWalletConnected]);

  // Check smart contract connection periodically
  useEffect(() => {
    if (user && isWalletConnected && primaryWallet?.address) {
      const interval = setInterval(() => {
        initializeSmartContractConnection(primaryWallet.address);
      }, 10000); // Check every 10 seconds

      return () => clearInterval(interval);
    }
  }, [user, isWalletConnected, primaryWallet?.address]);

  return {
    createOrLoginWithWallet,
    createWalletAccount,
    logoutWallet,
    isAuthenticating,
    isSmartContractReady
  };
};
