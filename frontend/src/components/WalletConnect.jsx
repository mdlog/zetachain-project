import React from 'react';
import { useAccount, useBalance, useChainId, useConnect, useDisconnect } from 'wagmi';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const WalletConnect = () => {
    const { address, isConnected } = useAccount();
    const { data: balance } = useBalance({
        address: address,
    });
    const chainId = useChainId();
    const { connect, connectors, isPending } = useConnect();
    const { disconnect } = useDisconnect();
    
    // Debug: log available connectors
    console.log('Available connectors:', connectors.map(c => c.name));

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
        // Find the best wallet connector to show
        const getBestConnector = () => {
            // Priority order: MetaMask > WalletConnect > Coinbase > Injected
            const priorities = ['MetaMask', 'WalletConnect', 'Coinbase Wallet', 'Injected'];
            
            for (const priority of priorities) {
                const connector = connectors.find(c => c.name === priority);
                if (connector) return connector;
            }
            
            // Fallback to first available connector
            return connectors[0];
        };
        
        const bestConnector = getBestConnector();
        
        if (!bestConnector) {
            return (
                <Button
                    disabled
                    className="bg-gray-600 text-gray-400 text-sm px-4 py-2"
                >
                    No Wallet Available
                </Button>
            );
        }
        
        return (
            <Button
                onClick={() => connect({ connector: bestConnector })}
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
            >
                {isPending ? 'Connecting...' : 'Connect Wallet'}
            </Button>
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

            {/* Disconnect Button */}
            <Button
                onClick={() => disconnect()}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
                Disconnect
            </Button>
        </div>
    );
};

export default WalletConnect;
