
// Global type declarations for external libraries

declare global {
  interface Window {
    // Solana Wallets
    solana?: {
      isPhantom?: boolean;
      isConnected?: boolean;
      connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: any) => Promise<any>;
      signAllTransactions: (transactions: any[]) => Promise<any[]>;
      signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
    };
    solflare?: {
      isSolflare?: boolean;
      isConnected?: boolean;
      connect: () => Promise<{ publicKey: { toString(): string } }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: any) => Promise<any>;
      signAllTransactions: (transactions: any[]) => Promise<any[]>;
    };
    backpack?: {
      isBackpack?: boolean;
      isConnected?: boolean;
      connect: () => Promise<{ publicKey: { toString(): string } }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: any) => Promise<any>;
      signAllTransactions: (transactions: any[]) => Promise<any[]>;
    };
    // EVM Wallets (Ethereum, Base, etc.)
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      selectedAddress?: string;
      chainId?: string;
    };
    // Stellar Wallet (Freighter)
    freighterApi?: {
      isConnected: () => Promise<boolean>;
      getPublicKey: () => Promise<string>;
      signTransaction: (xdr: string, opts?: { network?: string; networkPassphrase?: string }) => Promise<string>;
      isAllowed: () => Promise<boolean>;
      setAllowed: () => Promise<boolean>;
      getNetwork: () => Promise<string>;
      getNetworkDetails: () => Promise<{ network: string; networkUrl: string; networkPassphrase: string }>;
    };
    // PayPal
    paypal?: {
      Buttons: (config: {
        createOrder: (data: any, actions: any) => Promise<any>;
        onApprove: (data: any, actions: any) => Promise<any>;
        onError?: (err: any) => void;
        onCancel?: (data: any) => void;
      }) => {
        render: (selector: string) => void;
      };
    };
  }
}

export {};
