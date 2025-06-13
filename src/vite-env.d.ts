
/// <reference types="vite/client" />

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      isConnected?: boolean;
      connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: any) => Promise<any>;
      signAllTransactions: (transactions: any[]) => Promise<any[]>;
      signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
    };
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

declare module '@walletconnect/web3-provider' {
  export default class WalletConnectProvider {
    constructor(options: {
      infuraId?: string;
      rpc?: { [chainId: number]: string };
      chainId?: number;
      qrcodeModal?: {
        open: (uri: string, cb: any) => void;
        close: () => void;
      };
    });
    
    accounts: string[];
    chainId: number;
    
    enable(): Promise<string[]>;
    disconnect(): Promise<void>;
    on(event: string, callback: (...args: any[]) => void): void;
    request(args: { method: string; params?: any[] }): Promise<any>;
  }
}

export {};
