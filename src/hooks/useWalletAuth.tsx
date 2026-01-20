import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Generate a cryptographically secure nonce
const generateNonce = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Create a message for signing
const createSignMessage = (walletAddress: string, nonce: string): string => {
  return `Sign this message to authenticate with CyberCity.\n\nWallet: ${walletAddress}\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;
};

export const useWalletAuth = () => {
  const { user } = useAuth();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { toast } = useToast();

  const authInProgressRef = useRef(false);
  const lastAttemptedAddressRef = useRef<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSmartContractReady, setIsSmartContractReady] = useState(false);

  const safeResetAuthFlag = () => {
    authInProgressRef.current = false;
    setIsAuthenticating(false);
  };

  // Get wallet signature - supports multiple wallet types
  const getWalletSignature = useCallback(async (message: string): Promise<string | null> => {
    try {
      const encoder = new TextEncoder();
      const messageBytes = encoder.encode(message);

      if (primaryWallet?.type === 'phantom' && window.solana?.isPhantom && window.solana.signMessage) {
        const { signature } = await window.solana.signMessage(messageBytes);
        return btoa(String.fromCharCode(...signature));
      } else if (primaryWallet?.type === 'solflare' && window.solflare?.isSolflare) {
        // Solflare uses signTransaction for auth, skip signature
        return 'solflare_connected';
      } else if (primaryWallet?.type === 'backpack' && window.backpack?.isBackpack) {
        // Backpack uses signTransaction for auth, skip signature
        return 'backpack_connected';
      } else if (primaryWallet?.type === 'coinbase' && window.ethereum?.isCoinbaseWallet) {
        // For Ethereum wallets, use personal_sign
        const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
        if (accounts && accounts.length > 0) {
          const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, accounts[0]],
          }) as string;
          return signature;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting wallet signature:', error);
      return null;
    }
  }, [primaryWallet?.type]);

  const initializeSmartContractConnection = async (walletAddress: string) => {
    try {
      let isStillConnected = false;
      
      if (primaryWallet?.type === 'phantom' && window.solana?.isPhantom) {
        isStillConnected = window.solana.isConnected;
      } else if (primaryWallet?.type === 'solflare' && window.solflare?.isSolflare) {
        isStillConnected = window.solflare.isConnected;
      } else if (primaryWallet?.type === 'backpack' && window.backpack?.isBackpack) {
        isStillConnected = window.backpack.isConnected;
      } else if (primaryWallet?.type === 'coinbase' && window.ethereum?.isCoinbaseWallet) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        isStillConnected = accounts && accounts.length > 0;
      }

      setIsSmartContractReady(isStillConnected);
    } catch (error) {
      console.error('Error checking smart contract connection:', error);
      setIsSmartContractReady(false);
    }
  };

  const createOrLoginWithWallet = async (walletAddress: string) => {
    if (!walletAddress) return;

    if (authInProgressRef.current) {
      return;
    }

    // Check rate limiting
    const cooldownKey = `wallet-auth-cooldown:${walletAddress}`;
    const last = localStorage.getItem(cooldownKey);
    const now = Date.now();

    if (last && now - Number(last) < 10000) {
      // Too soon, wait a bit
      return;
    }

    authInProgressRef.current = true;
    setIsAuthenticating(true);
    lastAttemptedAddressRef.current = walletAddress;
    localStorage.setItem(cooldownKey, String(now));

    try {
      // Generate nonce for this authentication attempt
      const nonce = generateNonce();
      const signMessage = createSignMessage(walletAddress, nonce);
      
      // For external wallets, request signature
      if (primaryWallet?.type && primaryWallet.type !== 'created') {
        toast({
          title: "Sign to Authenticate",
          description: "Please sign the message in your wallet to verify ownership",
        });

        const signature = await getWalletSignature(signMessage);
        
        if (!signature) {
          toast({
            title: "Signature Required",
            description: "You must sign the message to authenticate",
            variant: "destructive",
          });
          return;
        }

        // Use signature as part of the password for added security
        // The password is now: wallet_address + signature_hash (not just wallet address)
        const data = new TextEncoder().encode(signature);
        const signatureHash = await crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer);
        const hashArray = Array.from(new Uint8Array(signatureHash));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Create secure credentials using signature
        const walletEmail = `${walletAddress.toLowerCase().slice(0, 8)}.wallet@cybercity.app`;
        const securePassword = `${walletAddress}_${hashHex.slice(0, 32)}`;

        // Try to sign in first
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: walletEmail,
          password: securePassword,
        });

        if (!signInError) {
          await initializeSmartContractConnection(walletAddress);
          toast({
            title: "Welcome back! 🎮",
            description: "Wallet verified and authenticated",
          });
          return;
        }

        // If invalid credentials, try to create account
        if (signInError.message?.includes('Invalid login credentials') || 
            signInError.message?.includes('email_provider_disabled')) {
          
          // For accounts created before signature auth, allow migration
          // Try with just wallet address as password (old format)
          const { error: legacySignInError } = await supabase.auth.signInWithPassword({
            email: walletEmail,
            password: walletAddress,
          });

          if (!legacySignInError) {
            // Legacy login worked - user should update their auth
            await initializeSmartContractConnection(walletAddress);
            toast({
              title: "Welcome back! 🎮",
              description: "Wallet authenticated",
            });
            return;
          }

          // Create new account with signature-based password
          const { error: signUpError } = await supabase.auth.signUp({
            email: walletEmail,
            password: securePassword,
            options: {
              emailRedirectTo: `${window.location.origin}/`,
              data: {
                username: `Wallet_${walletAddress.slice(0, 6)}`,
                wallet_address: walletAddress,
              },
            },
          });

          if (signUpError) {
            if ((signUpError as any)?.status === 429) {
              toast({
                title: "Please wait",
                description: "Too many attempts. Try again in a moment.",
              });
            } else if (signUpError.message?.includes('email_provider_disabled')) {
              // Email auth is disabled - inform user
              toast({
                title: "Email Auth Disabled",
                description: "Please enable email authentication in Supabase settings",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Authentication Error",
                description: signUpError.message || "Failed to create account",
                variant: "destructive",
              });
            }
            return;
          }

          toast({
            title: "Account Created! 🎉",
            description: "Check your email to confirm your account",
          });
        } else {
          toast({
            title: "Authentication Error",
            description: signInError.message || "Failed to authenticate",
            variant: "destructive",
          });
        }
      } else {
        // For created wallets, we need to handle differently
        // These should use the profile system directly without email auth
        toast({
          title: "Created Wallet",
          description: "Use an external wallet like Phantom for full authentication",
        });
      }

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

  // Auto-connect when wallet is connected
  useEffect(() => {
    const addr = primaryWallet?.address;
    
    if (addr && !user && isWalletConnected && lastAttemptedAddressRef.current !== addr && !authInProgressRef.current) {
      createOrLoginWithWallet(addr);
    } else if (addr && user && isWalletConnected && !isSmartContractReady) {
      initializeSmartContractConnection(addr);
    }
  }, [primaryWallet?.address, user, isWalletConnected]);

  // Periodic connection check
  useEffect(() => {
    if (user && isWalletConnected && primaryWallet?.address) {
      const interval = setInterval(() => {
        initializeSmartContractConnection(primaryWallet.address);
      }, 10000);

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
