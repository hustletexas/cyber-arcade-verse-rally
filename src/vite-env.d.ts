/// <reference types="vite/client" />

declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<boolean>;
      getPublicKey: () => Promise<string>;
      signTransaction: (xdr: string, opts?: { network?: string; networkPassphrase?: string }) => Promise<string>;
    };
  }
}

// Stellar-only architecture - ETH and SOL wallets removed

export {};
