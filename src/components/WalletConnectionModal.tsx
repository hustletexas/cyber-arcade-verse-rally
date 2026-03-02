import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wallet, ExternalLink, ChevronRight, Sparkles, Smartphone, ShieldCheck, Mail, User, Loader2 } from 'lucide-react';
import { ChainType, WalletType, CHAINS, WALLETS, WalletInfo, getWalletsByChain } from '@/types/wallet';
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  LOBSTR_ID,
  FREIGHTER_ID,
  HOTWALLET_ID,
} from '@creit.tech/stellar-wallets-kit';
import { WALLET_CONNECT_ID } from '@creit.tech/stellar-wallets-kit/modules/walletconnect.module';
import { WalletConnectModule, WalletConnectAllowedMethods } from '@creit.tech/stellar-wallets-kit/modules/walletconnect.module';
import { isMobileDevice, detectMobileWallets, getStoreLink, generateSignatureNonce, buildSignatureMessage } from '@/utils/mobileWalletDetection';
import { useTieredAuth } from '@/contexts/AuthContext';
import freighterApi from '@stellar/freighter-api';

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

// Map our wallet IDs to Stellar Wallets Kit module IDs
const WALLET_KIT_IDS: Record<string, string> = {
  lobstr: LOBSTR_ID,
  freighter: FREIGHTER_ID,
  hotwallet: HOTWALLET_ID,
};

// Chain display order for the wallet modal
const CHAIN_ORDER: ChainType[] = ['stellar', 'solana'];

export const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({
  isOpen,
  onClose,
  onWalletConnected
}) => {
  const { toast } = useToast();
  const { signInWithMagicLink } = useTieredAuth();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileWallets, setMobileWallets] = useState<string[]>([]);
  const [signatureStep, setSignatureStep] = useState<{ walletType: WalletType; address: string } | null>(null);
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [magicLinkSending, setMagicLinkSending] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [authMode, setAuthMode] = useState<'wallets' | 'magic_link'>('wallets');

  // Track which wallets are actually available (detected by kit modules)
  const [walletAvailability, setWalletAvailability] = useState<Record<string, boolean>>({
    lobstr: false,
    freighter: false,
    hotwallet: false,
    phantom: false,
  });

  // Build a shared StellarWalletsKit with all modules
  const buildKit = (selectedWalletId: string = LOBSTR_ID): StellarWalletsKit => {
    const wcProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';
    const modules = [...allowAllModules()];

    if (wcProjectId) {
      modules.push(
        new WalletConnectModule({
          url: window.location.origin,
          projectId: wcProjectId,
          method: WalletConnectAllowedMethods.SIGN,
          description: 'Connect your Stellar wallet to Cyber City Arcade',
          name: 'Cyber City Arcade',
          icons: ['https://cybercityarcade.com/favicon.ico'],
          network: WalletNetwork.PUBLIC,
        })
      );
    }

    return new StellarWalletsKit({
      network: WalletNetwork.PUBLIC,
      selectedWalletId,
      modules,
    });
  };

  // Detect mobile and check wallet availability via kit modules
  useEffect(() => {
    const detect = async () => {
      const mobile = isMobileDevice();
      setIsMobile(mobile);

      if (mobile) {
        const detected = await detectMobileWallets();
        setMobileWallets(detected);
        // On mobile, mark all as available (they use WalletConnect / deep links)
        setWalletAvailability({
          lobstr: true,
          freighter: true,
          hotwallet: true,
          phantom: true,
        });
      } else {
        // Desktop: detect extensions
        const phantomAvailable = !!window.phantom?.solana?.isPhantom;
        setWalletAvailability({
          lobstr: true,
          freighter: true,
          hotwallet: true,
          phantom: phantomAvailable,
        });
      }
    };

    if (isOpen) {
      detect();
      setSignatureStep(null);
      setAuthMode('wallets');
      setMagicLinkSent(false);
      setMagicLinkEmail('');
    }
  }, [isOpen]);

  // Handle magic link submission
  const handleMagicLink = async () => {
    if (!magicLinkEmail.trim()) return;
    setMagicLinkSending(true);
    const result = await signInWithMagicLink(magicLinkEmail.trim());
    setMagicLinkSending(false);
    if (result.success) {
      setMagicLinkSent(true);
      toast({
        title: "Magic Link Sent ✨",
        description: `Check ${magicLinkEmail} for your login link`,
      });
    } else {
      toast({
        title: "Failed to send",
        description: result.error || "Please try again",
        variant: "destructive",
      });
    }
  };

  // Handle guest login
  const handleGuestLogin = () => {
    onClose();
    toast({
      title: "Playing as Guest 🎮",
      description: "Free play enabled! Sign in anytime to save progress.",
    });
  };

  const completeConnection = (walletType: WalletType, address: string) => {
    const chain = WALLETS.find(w => w.id === walletType)?.chain || 'stellar';
    onWalletConnected(walletType, address, chain);
    onClose();
    const chainName = CHAINS[chain]?.name || chain;
    toast({
      title: `Wallet Connected! ${CHAINS[chain]?.icon || '✦'}`,
      description: `${walletType.charAt(0).toUpperCase() + walletType.slice(1)} on ${chainName}: ${address.slice(0, 8)}...${address.slice(-4)}`,
    });
  };

  // Unified connection via Stellar Wallets Kit for Stellar wallets
  const connectWithKit = async (walletType: WalletType) => {
    // Handle non-Stellar wallets
    if (walletType === 'phantom') {
      return connectPhantom();
    }



    const kitId = WALLET_KIT_IDS[walletType];
    if (!kitId) {
      throw new Error(`Unknown wallet type: ${walletType}`);
    }

    if (isMobile && (walletType === 'lobstr' || walletType === 'freighter')) {
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
        icons: ['https://cybercityarcade.com/favicon.ico'],
        network: WalletNetwork.PUBLIC,
      });

      const kit = new StellarWalletsKit({
        network: WalletNetwork.PUBLIC,
        selectedWalletId: WALLET_CONNECT_ID,
        modules: [wcModule],
      });

      kit.setWallet(WALLET_CONNECT_ID);

      toast({
        title: `Opening ${walletType === 'lobstr' ? 'LOBSTR' : 'Freighter'}...`,
        description: "Approve the connection in your wallet app",
      });

      const { address } = await kit.getAddress();
      if (address) {
        completeConnection(walletType, address);
      } else {
        throw new Error('No address returned. Make sure the wallet app is installed.');
      }
    } else if (isMobile && walletType === 'hotwallet') {
      toast({
        title: "Opening Hot Wallet...",
        description: "Connecting via Hot Wallet mobile",
      });

      try {
        const kit = buildKit(HOTWALLET_ID);
        kit.setWallet(HOTWALLET_ID);
        const { address } = await kit.getAddress();
        if (address) {
          completeConnection(walletType, address);
          return;
        }
      } catch (kitError) {
        console.warn('Hot Wallet kit module failed on mobile, trying deep link redirect...', kitError);
      }

      const callbackUrl = encodeURIComponent(window.location.href);
      const hotWalletUrl = `https://hotwallet.app/connect?callback=${callbackUrl}&app=Cyber+City+Arcade`;
      window.location.href = hotWalletUrl;
    } else if (walletType === 'freighter') {
      const accessResult = await freighterApi.requestAccess();
      if (accessResult.error) {
        throw new Error(accessResult.error);
      }
      const addrResult = await freighterApi.getAddress();
      if (addrResult.error) {
        throw new Error(addrResult.error);
      }
      if (addrResult.address) {
        completeConnection(walletType, addrResult.address);
      } else {
        throw new Error('No address returned from Freighter. Make sure the extension is unlocked.');
      }
    } else {
      const kit = buildKit(kitId);
      kit.setWallet(kitId);

      const { address } = await kit.getAddress();
      if (address) {
        completeConnection(walletType, address);
      } else {
        throw new Error(`No address returned from ${walletType}`);
      }
    }
  };

  // Phantom (Solana) connection
  const connectPhantom = async () => {
    const provider = window.phantom?.solana;
    
    if (provider?.isPhantom) {
      // Desktop extension detected
      const response = await provider.connect();
      const address = response.publicKey.toString();
      completeConnection('phantom', address);
    } else if (isMobile) {
      // Mobile: deep link to Phantom app
      const currentUrl = encodeURIComponent(window.location.href);
      const phantomUrl = `https://phantom.app/ul/browse/${currentUrl}?ref=${currentUrl}`;
      window.location.href = phantomUrl;
    } else {
      // Desktop: extension not installed
      window.open('https://phantom.app/', '_blank');
      throw new Error('Phantom wallet not found. Please install the Phantom extension.');
    }
  };


  // Connection handler per wallet type
  const connectWallet = async (walletType: WalletType) => {
    try {
      await connectWithKit(walletType);
    } catch (error: any) {
      console.error(`${walletType} connection error:`, error);
      const walletName = WALLETS.find(w => w.id === walletType)?.name || walletType;
      toast({
        title: "Connection Failed",
        description: error?.message || `Failed to connect to ${walletName}. Make sure it's installed.`,
        variant: "destructive",
      });
    }
  };

  const getWalletOptions = (): WalletOption[] => {
    // On mobile, only show Phantom wallet
    const walletIds: WalletType[] = isMobile 
      ? ['phantom'] 
      : ['lobstr', 'freighter', 'hotwallet', 'phantom'];

    const allOptions: WalletOption[] = walletIds
      .map(id => WALLETS.find(w => w.id === id))
      .filter((w): w is WalletInfo => !!w)
      .map(w => ({
        ...w,
        isInstalled: walletAvailability[w.id] ?? false,
        connect: () => connectWallet(w.id),
        isMobileReady: true,
      }));

    if (isMobile) {
      return allOptions.map(w => ({
        ...w,
        isInstalled: true, // Phantom is always available via deep link on mobile
      }));
    }

    return allOptions;
  };

  const walletOptions = getWalletOptions();
  
  // Group wallets by chain
  const walletsByChain = CHAIN_ORDER.map(chainId => ({
    chain: CHAINS[chainId],
    wallets: walletOptions.filter(w => w.chain === chainId),
  })).filter(group => group.wallets.length > 0);

  const handleWalletConnect = async (wallet: WalletOption) => {
    if (!wallet.isInstalled && isMobile) {
      const storeLink = getStoreLink(wallet.id);
      if (storeLink) {
        window.open(storeLink, '_blank');
        return;
      }
    }

    // On desktop, always attempt connection first — detection can be unreliable
    setConnecting(wallet.id);
    try {
      await wallet.connect();
    } catch (error: any) {
      console.error(`Failed to connect to ${wallet.name}:`, error);
      // If connection fails and wallet wasn't detected, suggest installing
      if (!wallet.isInstalled) {
        window.open(wallet.downloadUrl, '_blank');
      }
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
        data-testid={`wallet-btn-${wallet.id}`}
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
              {authMode === 'magic_link' 
                ? <Mail size={20} className="text-white" />
                : isMobile ? <Smartphone size={20} className="text-white" /> : <Wallet size={20} className="text-white" />
              }
            </div>
            {authMode === 'magic_link' 
              ? 'Sign In with Email'
              : isMobile ? 'Connect Mobile Wallet' : 'Connect Wallet'
            }
          </DialogTitle>
          <p className="text-sm text-white/50 mt-2">
            {authMode === 'magic_link'
              ? "We'll send you a magic link to sign in — no password needed"
              : isMobile 
                ? 'Tap a wallet to open it and sign in instantly' 
                : 'Choose a wallet to connect with USDC'
            }
          </p>
          {authMode === 'wallets' && (
            <div className="flex items-center gap-1.5 mt-2">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span className="text-[11px] text-emerald-400/70">Signature-verified connection</span>
            </div>
          )}
        </DialogHeader>

        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {authMode === 'magic_link' ? (
            /* Magic Link Form */
            <div className="space-y-4">
              {magicLinkSent ? (
                <div className="text-center space-y-3 py-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Mail size={28} className="text-emerald-400" />
                  </div>
                  <h3 className="text-white font-semibold">Check your inbox!</h3>
                  <p className="text-white/50 text-sm">
                    We sent a magic link to <span className="text-cyan-400">{magicLinkEmail}</span>. Click the link to sign in.
                  </p>
                  <button
                    onClick={() => { setMagicLinkSent(false); setMagicLinkEmail(''); }}
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Use a different email
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm text-white/60 font-medium">Email address</label>
                    <input
                      type="email"
                      value={magicLinkEmail}
                      onChange={(e) => setMagicLinkEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleMagicLink()}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all text-sm"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleMagicLink}
                    disabled={magicLinkSending || !magicLinkEmail.trim()}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {magicLinkSending ? (
                      <><Loader2 size={16} className="animate-spin" /> Sending...</>
                    ) : (
                      <><Mail size={16} /> Send Magic Link</>
                    )}
                  </button>
                  <p className="text-xs text-white/30 text-center">
                    Unlocks ranked play, tournaments, saved stats & more
                  </p>
                </>
              )}

              <button
                onClick={() => setAuthMode('wallets')}
                className="w-full text-sm text-white/40 hover:text-white/60 transition-colors py-2"
              >
                ← Back to wallet options
              </button>
            </div>
          ) : (
            /* Quick Start + Wallet Options */
            <>
              {/* Quick Start Options */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Quick Start</span>
                </div>

                {/* Guest */}
                <button
                  onClick={handleGuestLogin}
                  data-testid="guest-login-btn"
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <User size={20} className="text-white/60" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-semibold text-white/80 text-sm">Play as Guest</span>
                    <p className="text-xs text-white/40 mt-0.5">Jump in instantly — free play, no sign-up</p>
                  </div>
                  <ChevronRight size={18} className="text-white/20 group-hover:text-white/40 transition-colors" />
                </button>

                {/* Magic Link */}
                <button
                  onClick={() => setAuthMode('magic_link')}
                  data-testid="magic-link-btn"
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Mail size={20} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-semibold text-white text-sm">Magic Link</span>
                    <p className="text-xs text-white/50 mt-0.5">Sign in with email — no password needed</p>
                  </div>
                  <ChevronRight size={18} className="text-white/30 group-hover:text-white/60 transition-colors" />
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 px-1">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-white/30 uppercase tracking-wider">or connect wallet</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Mobile hint */}
              {isMobile && (
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                  <p className="text-xs text-cyan-300">
                    📱 Your wallet app will open for secure authentication. Approve the connection to sign in instantly.
                  </p>
                </div>
              )}

              {/* Wallets grouped by chain */}
              {walletsByChain.map(({ chain, wallets }) => (
                <div key={chain.id}>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    {chain.logoUrl ? (
                      <img src={chain.logoUrl} alt={chain.name} className="w-4 h-4 rounded-full" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                      <span className="text-sm" style={{ color: chain.color }}>{chain.icon}</span>
                    )}
                    <span className="text-xs font-medium text-white/40 uppercase tracking-wider">{chain.name}</span>
                    {chain.usdcSupported && (
                      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[9px] px-1.5 py-0 font-medium">
                        USDC
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    {wallets.map(wallet => (
                      <WalletButton key={wallet.id} wallet={wallet} />
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        {authMode === 'wallets' && (
          <div className="p-4 border-t border-white/5 bg-white/[0.02]">
            <p className="text-xs text-white/30 text-center">
              {isMobile ? 'Connect with Phantom wallet on Solana.' : 'Connect with USDC on Stellar or Solana.'}{' '}
              <a 
                href={isMobile ? 'https://phantom.app/' : 'https://lobstr.co/'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Get started →
              </a>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
