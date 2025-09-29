// Configuration for OmniYield Frontend
export const config = {
  // Backend API Configuration
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000',
  API_BASE_URL: `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api`,
  
  // ZetaChain Configuration
  ZETACHAIN: {
    RPC_URL: process.env.REACT_APP_ZETACHAIN_RPC_URL || 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
    CHAIN_ID: parseInt(process.env.REACT_APP_ZETACHAIN_CHAIN_ID || '7001'),
    EXPLORER_URL: process.env.REACT_APP_ZETACHAIN_EXPLORER_URL || 'https://explorer.zetachain.com',
    NATIVE_TOKEN: 'ZETA',
    BLOCK_TIME: 6, // seconds
  },
  
  // Supported Networks
  SUPPORTED_NETWORKS: [
    {
      chainId: 7001,
      chainName: 'ZetaChain Athens',
      nativeCurrency: { name: 'ZETA', symbol: 'ZETA', decimals: 18 },
      rpcUrls: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'],
      blockExplorerUrls: ['https://explorer.zetachain.com'],
    },
    {
      chainId: 1,
      chainName: 'Ethereum',
      nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
      rpcUrls: ['https://eth.llamarpc.com'],
      blockExplorerUrls: ['https://etherscan.io'],
    },
    {
      chainId: 56,
      chainName: 'BNB Smart Chain',
      nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
      rpcUrls: ['https://bsc-dataseed1.binance.org'],
      blockExplorerUrls: ['https://bscscan.com'],
    },
    {
      chainId: 137,
      chainName: 'Polygon',
      nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
      rpcUrls: ['https://polygon-rpc.com'],
      blockExplorerUrls: ['https://polygonscan.com'],
    },
    {
      chainId: 43114,
      chainName: 'Avalanche',
      nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
      rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
      blockExplorerUrls: ['https://snowtrace.io'],
    },
    {
      chainId: 42161,
      chainName: 'Arbitrum',
      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      rpcUrls: ['https://arb1.arbitrum.io/rpc'],
      blockExplorerUrls: ['https://arbiscan.io'],
    }
  ],
  
  // API Endpoints
  ENDPOINTS: {
    CHAINS: '/chains',
    PROTOCOLS: '/protocols',
    POOLS: '/pools',
    PORTFOLIO: '/portfolio',
    ARBITRAGE: '/arbitrage',
    ANALYTICS: '/analytics/overview',
    YIELD_HISTORY: '/analytics/yield-history',
    OPTIMIZE: '/strategy/optimize',
    ZETACHAIN_STATUS: '/zetachain/status',
    ZETACHAIN_BALANCE: '/zetachain/balance',
  },
  
  // UI Configuration
  UI: {
    REFRESH_INTERVAL: 30000, // 30 seconds
    MAX_POOLS_DISPLAY: 20,
    DEFAULT_SORT: 'apy',
    THEME: 'dark',
  },
  
  // Error Messages
  ERRORS: {
    NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
    API_ERROR: 'API request failed. Please try again later.',
    WALLET_ERROR: 'Wallet connection failed. Please try again.',
    INVALID_ADDRESS: 'Invalid wallet address format.',
  }
};

export default config;
