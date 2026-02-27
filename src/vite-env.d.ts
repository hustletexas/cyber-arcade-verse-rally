/// <reference types="vite/client" />

declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<boolean>;
      getPublicKey: () => Promise<string>;
      signTransaction: (xdr: string, opts?: { network?: string; networkPassphrase?: string }) => Promise<string>;
    };
    freighterApi?: any;
    phantom?: {
      solana?: {
        isPhantom?: boolean;
        connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
        disconnect: () => Promise<void>;
        signMessage: (message: Uint8Array, encoding?: string) => Promise<{ signature: Uint8Array }>;
        isConnected: boolean;
      };
    };
    hashpack?: any;
    xaman?: any;
  }
}

export {};
