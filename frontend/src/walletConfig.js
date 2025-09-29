import { createConfig, http } from 'wagmi';
import { mainnet, bsc, polygon, avalanche, arbitrum } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

// ZetaChain mainnet configuration
const zetaChainMainnet = {
    id: 7000,
    name: 'ZetaChain Mainnet',
    network: 'zetachain-mainnet',
    nativeCurrency: {
        decimals: 18,
        name: 'ZetaChain',
        symbol: 'ZETA',
    },
    rpcUrls: {
        public: { http: ['https://zetachain-evm.blockpi.network/v1/rpc/public'] },
        default: { http: ['https://zetachain-evm.blockpi.network/v1/rpc/public'] },
    },
    blockExplorers: {
        default: { name: 'ZetaChain Explorer', url: 'https://explorer.zetachain.com' },
    },
    testnet: false,
};

// ZetaChain testnet configuration (for fallback)
const zetaChainTestnet = {
    id: 7001,
    name: 'ZetaChain Athens Testnet',
    network: 'zetachain-athens',
    nativeCurrency: {
        decimals: 18,
        name: 'ZetaChain',
        symbol: 'ZETA',
    },
    rpcUrls: {
        public: { http: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'] },
        default: { http: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'] },
    },
    blockExplorers: {
        default: { name: 'ZetaChain Explorer', url: 'https://explorer.zetachain.com' },
    },
    testnet: true,
};

export const config = createConfig({
    chains: [
        zetaChainMainnet, // ZetaChain Mainnet as primary
        zetaChainTestnet, // ZetaChain Testnet as fallback
        mainnet,
        bsc,
        polygon,
        avalanche,
        arbitrum,
    ],
    connectors: [
        injected(),
        walletConnect({
            projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || 'omniyield-zetachain-demo',
        }),
        coinbaseWallet({
            appName: 'OmniYield',
        }),
    ],
    transports: {
        [zetaChainMainnet.id]: http(),
        [zetaChainTestnet.id]: http(),
        [mainnet.id]: http(),
        [bsc.id]: http(),
        [polygon.id]: http(),
        [avalanche.id]: http(),
        [arbitrum.id]: http(),
    },
    ssr: false,
});

export const supportedChains = [
    {
        ...zetaChainMainnet,
        iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/zeta.png',
    },
    {
        ...zetaChainTestnet,
        iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/zeta.png',
    },
    {
        ...mainnet,
        iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/eth.png',
    },
    {
        ...bsc,
        iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/bnb.png',
    },
    {
        ...polygon,
        iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/matic.png',
    },
    {
        ...avalanche,
        iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/avax.png',
    },
    {
        ...arbitrum,
        iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/arb.png',
    },
];

export default config;
