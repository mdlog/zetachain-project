import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const WalletConnect = () => {
    const { address, isConnected } = useAccount();
    const { data: balance } = useBalance({
        address: address,
    });
    const chainId = useChainId();

    const getChainName = (chainId) => {
        const chainNames = {
            7001: 'ZetaChain',
            1: 'Ethereum',
            56: 'BSC',
            137: 'Polygon',
            43114: 'Avalanche',
            42161: 'Arbitrum',
        };
        return chainNames[chainId] || `Chain ${chainId}`;
    };

    const getChainIcon = (chainId) => {
        const chainIcons = {
            7001: '⚡',
            1: '⟠',
            56: '🟡',
            137: '🟣',
            43114: '🔺',
            42161: '🔷',
        };
        return chainIcons[chainId] || '🔗';
    };

    if (!isConnected) {
        return (
            <div className="flex items-center space-x-4">
                <ConnectButton
                    label="Connect Wallet"
                    showBalance={false}
                    chainStatus="icon"
                    accountStatus="address"
                />
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-4">
            {/* Chain Status */}
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {getChainIcon(chainId)} {getChainName(chainId)}
            </Badge>

            {/* Balance */}
            {balance && (
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                </Badge>
            )}

            {/* Wallet Address */}
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                {address?.slice(0, 6)}...{address?.slice(-4)}
            </Badge>

            {/* Connect Button (for disconnect) */}
            <ConnectButton
                showBalance={false}
                chainStatus="icon"
                accountStatus="address"
            />
        </div>
    );
};

export default WalletConnect;
