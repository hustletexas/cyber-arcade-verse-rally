
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useWalletAuth = () => {
  const { user } = useAuth();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { toast } = useToast();

  const createOrLoginWithWallet = async (walletAddress: string) => {
    try {
      // First, check if a user with this wallet exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingProfile) {
        // User exists, try to sign them in using their email
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: existingProfile.email,
          password: walletAddress // Use wallet as password for wallet-only accounts
        });

        if (signInError) {
          // If password doesn't work, create a new account
          await createWalletAccount(walletAddress);
        } else {
          toast({
            title: "Welcome back!",
            description: "Logged in with your connected wallet",
          });
        }
      } else {
        // No existing profile, create new account
        await createWalletAccount(walletAddress);
      }
    } catch (error) {
      console.error('Error in wallet authentication:', error);
      await createWalletAccount(walletAddress);
    }
  };

  const createWalletAccount = async (walletAddress: string) => {
    try {
      // Use a more standard email format that Supabase will accept
      const walletEmail = `${walletAddress.toLowerCase().slice(0, 8)}.wallet@cybercity.app`;
      
      const { error } = await supabase.auth.signUp({
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

      if (error && error.message.includes('User already registered')) {
        // User exists, try to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: walletEmail,
          password: walletAddress,
        });

        if (signInError) {
          console.error('Sign in error:', signInError);
          toast({
            title: "Authentication Error",
            description: "Failed to authenticate with wallet. Please try again.",
            variant: "destructive",
          });
          return;
        }
      } else if (error) {
        console.error('Sign up error:', error);
        toast({
          title: "Authentication Error",
          description: error.message || "Failed to create wallet account",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Account Created!",
        description: "Successfully created and logged into your wallet account",
      });
    } catch (error: any) {
      console.error('Wallet account creation error:', error);
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to authenticate with wallet",
        variant: "destructive",
      });
    }
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

  // Auto-login when wallet connects and no user is logged in
  useEffect(() => {
    if (primaryWallet && !user && isWalletConnected) {
      console.log('Auto-authenticating with wallet:', primaryWallet.address);
      createOrLoginWithWallet(primaryWallet.address);
    }
  }, [primaryWallet, user, isWalletConnected]);

  return {
    createOrLoginWithWallet,
    createWalletAccount,
    logoutWallet
  };
};
