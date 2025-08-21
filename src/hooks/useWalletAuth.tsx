
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useWalletAuth = () => {
  const { user, loading: authLoading } = useAuth();
  const { getConnectedWallet, isWalletConnected } = useWallet();
  const { toast } = useToast();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authenticateWithWallet = async () => {
    const connectedWallet = getConnectedWallet();
    
    if (!connectedWallet) {
      toast({
        title: "No Wallet Connected",
        description: "Please connect your Phantom wallet first",
        variant: "destructive",
      });
      return false;
    }

    if (user) {
      // Already authenticated
      return true;
    }

    setIsAuthenticating(true);

    try {
      // Create a wallet-based email for authentication
      const walletEmail = `${connectedWallet.address}@wallet.cybercity`;
      const walletPassword = connectedWallet.address; // Use address as password

      // Try to sign in first
      let { data, error } = await supabase.auth.signInWithPassword({
        email: walletEmail,
        password: walletPassword,
      });

      // If user doesn't exist, create account
      if (error && error.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: walletEmail,
          password: walletPassword,
          options: {
            data: {
              wallet_address: connectedWallet.address,
              wallet_type: connectedWallet.type,
              username: `${connectedWallet.type}_${connectedWallet.address.slice(0, 8)}`,
            }
          }
        });

        if (signUpError) {
          throw signUpError;
        }

        // Try signing in again after signup
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: walletEmail,
          password: walletPassword,
        });

        if (signInError) {
          throw signInError;
        }

        data = signInData;
      } else if (error) {
        throw error;
      }

      if (data.user) {
        toast({
          title: "Wallet Authentication Success! 🎉",
          description: `Authenticated with ${connectedWallet.type} wallet`,
        });
        return true;
      }

    } catch (error: any) {
      console.error('Wallet authentication error:', error);
      toast({
        title: "Authentication Failed",
        description: error.message || "Failed to authenticate with wallet",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }

    return false;
  };

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (isWalletConnected() && !user && !authLoading && !isAuthenticating) {
      authenticateWithWallet();
    }
  }, [isWalletConnected(), user, authLoading]);

  return {
    authenticateWithWallet,
    isAuthenticating,
    isFullyAuthenticated: user && isWalletConnected(),
  };
};
