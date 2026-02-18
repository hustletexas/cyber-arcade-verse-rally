// Mobile wallet detection and deep link utilities for Stellar wallets

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const isIOS = (): boolean => {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

export const isAndroid = (): boolean => {
  return /Android/i.test(navigator.userAgent);
};

// Generate a random nonce for signature verification
export const generateSignatureNonce = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `CyberCityArcade-Auth-${timestamp}-${random}`;
};

// Build the challenge message for wallet signature
export const buildSignatureMessage = (nonce: string): string => {
  return `Sign this message to verify your identity on Cyber City Arcade.\n\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;
};

interface MobileWalletInfo {
  id: string;
  name: string;
  deepLinkScheme: string;
  appStoreUrl: string;
  playStoreUrl: string;
  isLikelyInstalled: boolean;
}

// Known deep link schemes for Stellar mobile wallets
export const MOBILE_WALLET_DEEP_LINKS: Record<string, MobileWalletInfo> = {
  lobstr: {
    id: 'lobstr',
    name: 'LOBSTR',
    deepLinkScheme: 'lobstr://',
    appStoreUrl: 'https://apps.apple.com/app/lobstr-stellar-wallet/id1404357892',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.lobstr.client',
    isLikelyInstalled: false,
  },
  xbull: {
    id: 'xbull',
    name: 'xBull',
    deepLinkScheme: 'xbull://',
    appStoreUrl: 'https://apps.apple.com/app/xbull-wallet/id1614686498',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=app.xbull.wallet',
    isLikelyInstalled: false,
  },
};

// Attempt to detect installed mobile wallets by trying deep links
// Note: This is best-effort - browsers restrict true app detection for privacy
export const detectMobileWallets = async (): Promise<string[]> => {
  if (!isMobileDevice()) return [];
  
  const detected: string[] = [];
  
  // On mobile, LOBSTR and xBull work via WalletConnect through Stellar Wallets Kit
  // We can't truly detect installed apps, but we can prioritize mobile-friendly wallets
  // LOBSTR is always available via WalletConnect on mobile
  detected.push('lobstr');
  
  // xBull also supports WalletConnect
  detected.push('xbull');
  
  // Albedo works in mobile browsers (web-based)
  detected.push('albedo');
  
  // Hot Wallet works in mobile browsers
  detected.push('hotwallet');
  
  return detected;
};

// Get the appropriate store link for the current platform
export const getStoreLink = (walletId: string): string | null => {
  const wallet = MOBILE_WALLET_DEEP_LINKS[walletId];
  if (!wallet) return null;
  
  if (isIOS()) return wallet.appStoreUrl;
  if (isAndroid()) return wallet.playStoreUrl;
  return null;
};
