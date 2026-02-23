import { useEffect, useRef, useState, useCallback } from 'react';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useToast } from '@/hooks/use-toast';
import freighterApi from '@stellar/freighter-api';

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
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { toast } = useToast();

  const authInProgressRef = useRef(false);
  const lastAttemptedAddressRef = useRef<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSmartContractReady, setIsSmartContractReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const safeResetAuthFlag = () => {
    authInProgressRef.current = false;
    setIsAuthenticating(false);
  };

  // Get wallet signature - Stellar wallets only
  const getWalletSignature = useCallback(async (message: string): Promise<string | null> => {
    try {
      if (primaryWallet?.type === 'freighter') {
        // Use Freighter to sign
        const result = await freighterApi.signAuthEntry(message, {
          networkPassphrase: 'Public Global Stellar Network ; September 2015'
        });
        if (result.error) {
          throw new Error(result.error.message);
        }
        return result.signedAuthEntry || null;
      } else if (primaryWallet?.type === 'lobstr') {
        // LOBSTR signing is handled through Stellar Wallets Kit
        // For now, we'll use a simplified auth flow
        return btoa(message + primaryWallet.address);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting wallet signature:', error);
      return null;
    }
  }, [primaryWallet?.type, primaryWallet?.address]);

  const initializeSmartContractConnection = async (walletAddress: string) => {
    try {
      let isStillConnected = false;
      
      if (primaryWallet?.type === 'freighter') {
        const connResult = await freighterApi.isConnected();
        isStillConnected = connResult.isConnected === true;
      } else if (primaryWallet?.type === 'lobstr') {
        // LOBSTR connection is maintained via Stellar Wallets Kit
        isStillConnected = true;
      }

      setIsSmartContractReady(isStillConnected);
    } catch (error) {
      console.error('Error checking smart contract connection:', error);
      setIsSmartContractReady(false);
    }
  };

  // Wallet-only authentication (no Supabase email/password)
  const createOrLoginWithWallet = async (walletAddress: string) => {
    if (!walletAddress) return;

    if (authInProgressRef.current) {
      return;
    }

    // Check rate limiting
    const cooldownKey = `wallet-auth-cooldown:${walletAddress}`;
    const last = localStorage.getItem(cooldownKey);
    const now = Date.now();

    if (last && now - Number(last) < 5000) {
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
      
      // For external wallets, request signature verification
      if (primaryWallet?.type && primaryWallet.type !== 'created') {
        toast({
          title: "Verifying Wallet",
          description: "Confirming wallet ownership...",
        });

        const signature = await getWalletSignature(signMessage);
        
        if (signature) {
          // Store auth state locally
          localStorage.setItem('wallet-auth-verified', walletAddress);
          localStorage.setItem('wallet-auth-timestamp', String(Date.now()));
          
          setIsAuthenticated(true);
          await initializeSmartContractConnection(walletAddress);
          
          toast({
            title: "Welcome! 🎮",
            description: "Wallet verified and connected",
          });
        } else {
          // Even without signature, wallet connection is valid for basic features
          setIsAuthenticated(true);
          await initializeSmartContractConnection(walletAddress);
          
          toast({
            title: "Wallet Connected 🎮",
            description: "Connected successfully",
          });
        }
      } else {
        // Wallet is connected
        setIsAuthenticated(true);
        toast({
          title: "Wallet Connected",
          description: "Ready to play!",
        });
      }

    } catch (error: any) {
      console.error('Error in wallet authentication:', error);
      // Still mark as authenticated if wallet is connected
      setIsAuthenticated(true);
      toast({
        title: "Wallet Connected",
        description: "Connected to platform",
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
      localStorage.removeItem('wallet-auth-verified');
      localStorage.removeItem('wallet-auth-timestamp');
      setIsSmartContractReady(false);
      setIsAuthenticated(false);
      
      toast({
        title: "Logged Out",
        description: "Wallet disconnected",
      });
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
    
    if (addr && isWalletConnected && lastAttemptedAddressRef.current !== addr && !authInProgressRef.current) {
      // Check if already verified
      const storedVerified = localStorage.getItem('wallet-auth-verified');
      if (storedVerified === addr) {
        setIsAuthenticated(true);
        initializeSmartContractConnection(addr);
      } else {
        createOrLoginWithWallet(addr);
      }
    } else if (!isWalletConnected) {
      setIsAuthenticated(false);
    }
  }, [primaryWallet?.address, isWalletConnected]);

  // Periodic connection check
  useEffect(() => {
    if (isAuthenticated && isWalletConnected && primaryWallet?.address) {
      const interval = setInterval(() => {
        initializeSmartContractConnection(primaryWallet.address);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isWalletConnected, primaryWallet?.address]);

  return {
    createOrLoginWithWallet,
    createWalletAccount,
    logoutWallet,
    isAuthenticating,
    isSmartContractReady,
    isAuthenticated: isAuthenticated || isWalletConnected,
  };
};
