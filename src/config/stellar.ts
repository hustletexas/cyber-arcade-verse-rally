// Stellar Network Configuration
// LIVE ON MAINNET

export const STELLAR_NETWORK = {
  // Set to true for mainnet, false for testnet
  isMainnet: true,
  
  // Network identifiers
  networkPassphrase: 'Public Global Stellar Network ; September 2015',
  
  // Horizon API endpoints
  horizonUrl: 'https://horizon.stellar.org',
  
  // Soroban RPC endpoint
  sorobanRpcUrl: 'https://soroban.stellar.org',
  
  // Display name
  networkName: 'Mainnet',
  
  // Explorer URLs
  explorerUrl: 'https://stellar.expert/explorer/public',
  
  // Asset configurations for Mainnet
  assets: {
    USDC: {
      code: 'USDC',
      // Circle's official USDC issuer on Stellar Mainnet
      issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
      decimals: 7,
    },
    PYUSD: {
      code: 'PYUSD',
      // PayPal's official PYUSD issuer on Stellar Mainnet
      issuer: 'GDGTVWSM4MGS4T7Z6W4RPWOCHE2I6RDFCIFZGS3DOA63LWQTRNZNTTFF',
      decimals: 7,
    },
  },
};

// Helper to get the correct Horizon URL
export const getHorizonUrl = () => STELLAR_NETWORK.horizonUrl;

// Helper to get explorer URL for a transaction
export const getTransactionExplorerUrl = (hash: string) => 
  `${STELLAR_NETWORK.explorerUrl}/tx/${hash}`;

// Helper to get explorer URL for an account
export const getAccountExplorerUrl = (address: string) => 
  `${STELLAR_NETWORK.explorerUrl}/account/${address}`;

// Mainnet configuration (for future use)
export const MAINNET_CONFIG = {
  networkPassphrase: 'Public Global Stellar Network ; September 2015',
  horizonUrl: 'https://horizon.stellar.org',
  sorobanRpcUrl: 'https://soroban.stellar.org',
  explorerUrl: 'https://stellar.expert/explorer/public',
  assets: {
    USDC: {
      code: 'USDC',
      issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
      decimals: 7,
    },
    PYUSD: {
      code: 'PYUSD',
      issuer: 'GDGTVWSM4MGS4T7Z6W4RPWOCHE2I6RDFCIFZGS3DOA63LWQTRNZNTTFF',
      decimals: 7,
    },
  },
};
