import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { zetaTestnet, mainnet, bsc, polygon, avalanche, arbitrum } from 'wagmi/chains';

// ZetaChain testnet configuration
const zetaChain = {
    id: 7001,
    name: 'ZetaChain Athens',
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

export const config = getDefaultConfig({
    appName: 'OmniYield',
    projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || 'omniyield-zetachain-demo', // You can get this from WalletConnect Cloud
    chains: [
        zetaChain, // ZetaChain as primary
        mainnet,
        bsc,
        polygon,
        avalanche,
        arbitrum,
    ],
    ssr: false, // If your dApp uses server side rendering (SSR)
});

export const supportedChains = [
    {
        ...zetaChain,
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
