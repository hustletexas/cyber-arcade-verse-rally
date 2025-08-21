
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
      const walletEmail = `${walletAddress.slice(0, 8)}@wallet.cybercity`;
      
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
          throw signInError;
        }
      } else if (error) {
        throw error;
      }

      toast({
        title: "Account Created!",
        description: "Successfully created and logged into your wallet account",
      });
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to authenticate with wallet",
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
    createWalletAccount
  };
};
