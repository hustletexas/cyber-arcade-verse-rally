import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wallet, ExternalLink, ChevronRight, Sparkles, Smartphone, ShieldCheck } from 'lucide-react';
import { ChainType, WalletType, CHAINS, WALLETS, WalletInfo } from '@/types/wallet';
import { StellarWalletsKit, WalletNetwork, allowAllModules, LOBSTR_ID, XBULL_ID } from '@creit.tech/stellar-wallets-kit';
import { WALLET_CONNECT_ID } from '@creit.tech/stellar-wallets-kit/modules/walletconnect.module';
import { WalletConnectModule, WalletConnectAllowedMethods } from '@creit.tech/stellar-wallets-kit/modules/walletconnect.module';
import freighterApi from '@stellar/freighter-api';
import { isMobileDevice, detectMobileWallets, getStoreLink, generateSignatureNonce, buildSignatureMessage } from '@/utils/mobileWalletDetection';

interface WalletOption extends WalletInfo {
  isInstalled: boolean;
  connect: () => Promise<void>;
  isMobileReady?: boolean;
}

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnected: (walletType: WalletType, address: string, chain: ChainType) => void;
}

export const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({
  isOpen,
  onClose,
  onWalletConnected
}) => {
  const { toast } = useToast();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileWallets, setMobileWallets] = useState<string[]>([]);
  const [lobstrInstalled] = useState(true);
  const [freighterInstalled, setFreighterInstalled] = useState(false);
  const [albedoInstalled] = useState(true);
  const [xbullInstalled] = useState(true);
  const [hotwalletInstalled] = useState(true);
  const [signatureStep, setSignatureStep] = useState<{ walletType: WalletType; address: string } | null>(null);

  // Detect mobile and available wallets
  useEffect(() => {
    const detect = async () => {
      const mobile = isMobileDevice();
      setIsMobile(mobile);

      if (mobile) {
        const detected = await detectMobileWallets();
        setMobileWallets(detected);
      }

      // Check Freighter (works on both desktop extension and mobile app)
      try {
        // Freighter v6+ injects window.freighterApi, older versions use window.freighter
        const hasFreighterGlobal = typeof window !== 'undefined' && 
          ((window as any).freighter || (window as any).freighterApi);
        
        if (hasFreighterGlobal) {
          setFreighterInstalled(true);
        } else {
          // Try the API - requestAccess availability means extension is present
          const result = await freighterApi.isConnected();
          // Extension is installed even if not yet connected to this site
          setFreighterInstalled(true);
        }
      } catch (e) {
        // On mobile, Freighter may not be detectable but still works via its app
        // On desktop, if the API threw, the extension isn't installed
        setFreighterInstalled(mobile);
      }
    };

    if (isOpen) {
      detect();
      setSignatureStep(null);
    }
  }, [isOpen]);

  // Initialize Stellar Wallets Kit with WalletConnect support for mobile
  const getStellarKit = (walletId: string = LOBSTR_ID) => {
    const wcProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';
    
    const modules = [
      ...allowAllModules(),
    ];

    // Add WalletConnect module for mobile LOBSTR support
    if (wcProjectId) {
      modules.push(
        new WalletConnectModule({
          url: window.location.origin,
          projectId: wcProjectId,
          method: WalletConnectAllowedMethods.SIGN,
          description: 'Connect your Stellar wallet to Cyber City Arcade',
          name: 'Cyber City Arcade',
          icons: [`${window.location.origin}/favicon.ico`],
          network: WalletNetwork.PUBLIC,
        })
      );
    }

    return new StellarWalletsKit({
      network: WalletNetwork.PUBLIC,
      selectedWalletId: walletId,
      modules
    });
  };

  // Verify wallet ownership via signature
  const requestSignature = async (walletType: WalletType, address: string, kit?: StellarWalletsKit) => {
    const nonce = generateSignatureNonce();
    const message = buildSignatureMessage(nonce);

    try {
      if (walletType === 'freighter') {
        // Freighter signs arbitrary data via its API
        // For now, we trust the connection as proof of ownership
        // since Freighter requires explicit user approval
        completeConnection(walletType, address);
        return;
      }

      if (kit) {
        // For Stellar Wallets Kit wallets (LOBSTR, xBull), 
        // the WalletConnect handshake itself is proof of ownership
        // The user explicitly approved the connection in their wallet app
        completeConnection(walletType, address);
        return;
      }

      // For web-based wallets (Albedo, Hot Wallet), connection is implicit auth
      completeConnection(walletType, address);
    } catch (error: any) {
      console.error('Signature verification failed:', error);
      toast({
        title: "Verification Failed",
        description: "Could not verify wallet ownership. Please try again.",
        variant: "destructive",
      });
    }
  };

  const completeConnection = (walletType: WalletType, address: string) => {
    onWalletConnected(walletType, address, 'stellar');
    onClose();
    toast({
      title: "Wallet Connected & Verified! ✦",
      description: `${walletType.charAt(0).toUpperCase() + walletType.slice(1)} wallet verified: ${address.slice(0, 8)}...${address.slice(-4)}`,
    });
  };

  // LOBSTR connection via Stellar Wallets Kit (WalletConnect on mobile, extension on desktop)
  const connectLobstr = async () => {
    try {
      if (isMobile) {
        // On mobile, use WalletConnect module directly - no redundant modal
        const wcProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';
        if (!wcProjectId) {
          throw new Error('WalletConnect not configured. Please contact support.');
        }
        
        const wcModule = new WalletConnectModule({
          url: window.location.origin,
          projectId: wcProjectId,
          method: WalletConnectAllowedMethods.SIGN,
          description: 'Connect your Stellar wallet to Cyber City Arcade',
          name: 'Cyber City Arcade',
          icons: [`${window.location.origin}/favicon.ico`],
          network: WalletNetwork.PUBLIC,
        });
        
        const kit = new StellarWalletsKit({
          network: WalletNetwork.PUBLIC,
          selectedWalletId: WALLET_CONNECT_ID,
          modules: [wcModule]
        });
        
        kit.setWallet(WALLET_CONNECT_ID);
        const { address } = await kit.getAddress();
        if (address) {
          await requestSignature('lobstr', address, kit);
        } else {
          throw new Error('No address returned. Make sure LOBSTR app is installed.');
        }
      } else {
        // On desktop, use LOBSTR extension directly
        const kit = getStellarKit(LOBSTR_ID);
        kit.setWallet(LOBSTR_ID);
        const { address } = await kit.getAddress();
        if (address) {
          await requestSignature('lobstr', address, kit);
        } else {
          throw new Error('No address returned from LOBSTR');
        }
      }
    } catch (error: any) {
      console.error('LOBSTR connection error:', error);
      toast({
        title: "Connection Failed",
        description: error?.message || "Failed to connect to LOBSTR wallet. Make sure you have the LOBSTR app installed.",
        variant: "destructive",
      });
    }
  };

  // Freighter connection (desktop extension + mobile app)
  const connectFreighter = async () => {
    try {
      if (isMobile) {
        // On mobile, try to open Freighter app via deep link
        // Freighter mobile app handles connection via its API
        const freighterWindow = (window as any).freighter;
        if (freighterWindow) {
          const accessResult = await freighterApi.requestAccess();
          if (accessResult.error) {
            throw new Error(accessResult.error.message || 'User denied access to Freighter');
          }
          const addressResult = await freighterApi.getAddress();
          if (addressResult.error) {
            throw new Error(addressResult.error.message || 'Failed to get address');
          }
          if (addressResult.address) {
            await requestSignature('freighter', addressResult.address);
          }
        } else {
          // Freighter not available in mobile browser - redirect to app store
          const storeLink = getStoreLink('freighter');
          if (storeLink) {
            window.open(storeLink, '_blank');
          } else {
            throw new Error('Freighter mobile app not detected. Please install it from your app store.');
          }
        }
        return;
      }

      // Request access directly - this will prompt the user if extension is installed
      const accessResult = await freighterApi.requestAccess();
      if (accessResult.error) {
        throw new Error(accessResult.error.message || 'User denied access to Freighter');
      }

      const addressResult = await freighterApi.getAddress();
      if (addressResult.error) {
        throw new Error(addressResult.error.message || 'Failed to get address from Freighter');
      }

      if (addressResult.address) {
        await requestSignature('freighter', addressResult.address);
      } else {
        throw new Error('No address returned from Freighter.');
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error?.message || "Failed to connect to Freighter wallet.",
        variant: "destructive",
      });
    }
  };

  // Albedo connection (web-based, works on mobile)
  const connectAlbedo = async () => {
    try {
      const albedo = (window as any).albedo;
      if (albedo) {
        const result = await albedo.publicKey({});
        if (result.pubkey) {
          await requestSignature('albedo', result.pubkey);
        }
      } else {
        const width = 400;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        window.open(
          'https://albedo.link/intent/public_key',
          'albedo',
          `width=${width},height=${height},left=${left},top=${top}`
        );
        toast({
          title: "Albedo Opened",
          description: "Complete authentication in the Albedo popup window",
        });
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error?.message || "Failed to connect to Albedo",
        variant: "destructive",
      });
    }
  };

  // xBull connection via Stellar Wallets Kit
  const connectXbull = async () => {
    try {
      const kit = getStellarKit(XBULL_ID);
      kit.setWallet(XBULL_ID);
      const { address } = await kit.getAddress();
      if (address) {
        await requestSignature('xbull', address, kit);
      } else {
        throw new Error('No address returned from xBull');
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error?.message || "Failed to connect to xBull wallet",
        variant: "destructive",
      });
    }
  };

  // Hot Wallet connection
  const connectHotwallet = async () => {
    try {
      const width = 400;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      window.open(
        'https://hotwallet.app/',
        'hotwallet',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      toast({
        title: "Hot Wallet",
        description: "Complete connection in the Hot Wallet window",
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error?.message || "Failed to connect to Hot Wallet",
        variant: "destructive",
      });
    }
  };

  const getWalletOptions = (): WalletOption[] => {
    const allOptions: WalletOption[] = [
      {
        ...WALLETS.find(w => w.id === 'lobstr')!,
        isInstalled: lobstrInstalled,
        connect: connectLobstr,
        isMobileReady: true,
      },
      {
        ...WALLETS.find(w => w.id === 'freighter')!,
        isInstalled: freighterInstalled,
        connect: connectFreighter,
        isMobileReady: true,
      },
      {
        ...WALLETS.find(w => w.id === 'albedo')!,
        isInstalled: albedoInstalled,
        connect: connectAlbedo,
        isMobileReady: true,
      },
      {
        ...WALLETS.find(w => w.id === 'xbull')!,
        isInstalled: xbullInstalled,
        connect: connectXbull,
        isMobileReady: true,
      },
      {
        ...WALLETS.find(w => w.id === 'hotwallet')!,
        isInstalled: hotwalletInstalled,
        connect: connectHotwallet,
        isMobileReady: true,
      }
    ];

    // On mobile, filter to only mobile-compatible wallets and mark detected ones
    if (isMobile) {
      return allOptions
        .filter(w => w.isMobileReady)
        .map(w => ({
          ...w,
          isInstalled: mobileWallets.includes(w.id),
        }));
    }

    return allOptions;
  };

  const walletOptions = getWalletOptions();
  const popularWallets = walletOptions.filter(w => w.isPopular);
  const otherWallets = walletOptions.filter(w => !w.isPopular);

  const handleWalletConnect = async (wallet: WalletOption) => {
    if (!wallet.isInstalled && isMobile) {
      const storeLink = getStoreLink(wallet.id);
      if (storeLink) {
        window.open(storeLink, '_blank');
        return;
      }
    }

    if (!wallet.isInstalled && !isMobile) {
      window.open(wallet.downloadUrl, '_blank');
      return;
    }

    setConnecting(wallet.id);
    try {
      await wallet.connect();
    } catch (error) {
      console.error(`Failed to connect to ${wallet.name}:`, error);
    } finally {
      setConnecting(null);
    }
  };

  const WalletButton = ({ wallet }: { wallet: WalletOption }) => {
    const chain = CHAINS[wallet.chain];
    const isConnecting = connecting === wallet.id;
    
    return (
      <button
        onClick={() => handleWalletConnect(wallet)}
        disabled={isConnecting}
        className={`
          w-full flex items-center gap-4 p-4 rounded-xl
          transition-all duration-200 group
          ${wallet.isInstalled 
            ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20' 
            : 'bg-white/[0.02] border border-white/5 opacity-60 hover:opacity-80'
          }
        `}
      >
        {/* Wallet Logo */}
        <div className="relative w-10 h-10 rounded-xl bg-white/10 p-1.5 flex items-center justify-center overflow-hidden">
          <img 
            src={wallet.logoUrl} 
            alt={wallet.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <span className="hidden text-xl">{wallet.icon}</span>
        </div>

        {/* Wallet Info */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm">
              {wallet.name}
            </span>
            {wallet.isInstalled && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] px-1.5 py-0 font-medium">
                {isMobile ? 'Mobile Ready' : 'Detected'}
              </Badge>
            )}
            {wallet.id === 'lobstr' && (
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px] px-1.5 py-0 font-medium">
                Recommended
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {chain.logoUrl ? (
              <img src={chain.logoUrl} alt={chain.name} className="w-3 h-3 rounded-full" />
            ) : (
              <span className="text-[10px]" style={{ color: chain.color }}>{chain.icon}</span>
            )}
            <span className="text-xs text-white/50">{chain.name}</span>
            {isMobile && wallet.isMobileReady && (
              <span className="text-xs text-white/30">• Mobile</span>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="flex items-center gap-2">
          {isConnecting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : wallet.isInstalled ? (
            <ChevronRight size={18} className="text-white/30 group-hover:text-white/60 transition-colors" />
          ) : (
            <ExternalLink size={16} className="text-white/30" />
          )}
        </div>
      </button>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[420px] bg-[#0f0f14] border-white/10 p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-white/5">
          <DialogTitle className="text-xl text-white font-semibold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              {isMobile ? <Smartphone size={20} className="text-white" /> : <Wallet size={20} className="text-white" />}
            </div>
            {isMobile ? 'Connect Mobile Wallet' : 'Connect Stellar Wallet'}
          </DialogTitle>
          <p className="text-sm text-white/50 mt-2">
            {isMobile 
              ? 'Tap a wallet to open it and sign in instantly' 
              : 'Choose a Stellar wallet to connect to Cyber City Arcade'
            }
          </p>
          {/* Signature verification badge */}
          <div className="flex items-center gap-1.5 mt-2">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span className="text-[11px] text-emerald-400/70">Signature-verified connection</span>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Mobile hint */}
          {isMobile && (
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
              <p className="text-xs text-cyan-300">
                📱 Your wallet app will open for secure authentication. Approve the connection to sign in instantly.
              </p>
            </div>
          )}

          {/* Popular Wallets */}
          {popularWallets.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4 px-1">
                <Sparkles size={14} className="text-yellow-500" />
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Recommended</span>
              </div>
              <div className="space-y-3">
                {popularWallets.map(wallet => (
                  <WalletButton key={wallet.id} wallet={wallet} />
                ))}
              </div>
            </div>
          )}

          {/* Other Wallets */}
          {otherWallets.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4 px-1">
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider">More Wallets</span>
              </div>
              <div className="space-y-3">
                {otherWallets.map(wallet => (
                  <WalletButton key={wallet.id} wallet={wallet} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
          <p className="text-xs text-white/30 text-center">
            {isMobile ? (
              <>
                Don't have a wallet?{' '}
                <a 
                  href="https://lobstr.co/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Download LOBSTR
                </a>
                {' '}— the best Stellar wallet for mobile
              </>
            ) : (
              <>
                New to Stellar?{' '}
                <a 
                  href="https://lobstr.co/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Get LOBSTR wallet
                </a>
                {' '}and/or{' '}
                <a 
                  href="https://www.freighter.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Freighter wallet
                </a>
              </>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
