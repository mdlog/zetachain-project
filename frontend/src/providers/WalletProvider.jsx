import React from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import config from '../walletConfig';

// Import RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css';

// Create a client
const queryClient = new QueryClient();

// Custom theme for RainbowKit
const customTheme = darkTheme({
    accentColor: '#7c3aed', // Purple accent
    accentColorForeground: 'white',
    borderRadius: 'medium',
    fontStack: 'system',
    overlayBlur: 'small',
});

export function WalletProvider({ children }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={customTheme}
                    appInfo={{
                        appName: 'OmniYield',
                        learnMoreUrl: 'https://zetachain.com',
                    }}
                    initialChain={config.chains[0]} // ZetaChain as default
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

export default WalletProvider;
