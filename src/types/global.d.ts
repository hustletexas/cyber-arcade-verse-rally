
// Global type declarations for external libraries

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: any) => Promise<any>;
      signAllTransactions: (transactions: any[]) => Promise<any[]>;
    };
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
