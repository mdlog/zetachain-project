import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Progress } from "./components/ui/progress";
import { Separator } from "./components/ui/separator";
import { WalletProvider } from "./providers/WalletProvider";
import WalletConnect from "./components/WalletConnect";
import { useAccount } from "wagmi";
import config from "./config";

const API = config.API_BASE_URL;

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [pools, setPools] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [arbitrage, setArbitrage] = useState([]);
  const [chains, setChains] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChain, setSelectedChain] = useState('all');
  const [zetachainStatus, setZetachainStatus] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [zetaPools, setZetaPools] = useState([]);
  const [supportedChains, setSupportedChains] = useState([]);
  const [crossChainTx, setCrossChainTx] = useState(null);

  // Use wagmi hooks for wallet connection
  const { address, isConnected } = useAccount();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apiStatusRes, zetachainStatusRes, analyticsRes, poolsRes, portfolioRes, arbitrageRes, chainsRes, protocolsRes, zetaPoolsRes, supportedChainsRes] = await Promise.all([
        axios.get(`${API}/`).catch(() => ({ data: { error: 'API not available' } })),
        axios.get(`${API}/zetachain/status`).catch(() => ({ data: { error: 'ZetaChain not available' } })),
        axios.get(`${API}/analytics/overview`).catch(() => ({ data: null })),
        axios.get(`${API}/pools`).catch(() => ({ data: [] })),
        axios.get(`${API}/portfolio`).catch(() => ({ data: [] })),
        axios.get(`${API}/arbitrage`).catch(() => ({ data: [] })),
        axios.get(`${API}/chains`).catch(() => ({ data: [] })),
        axios.get(`${API}/protocols`).catch(() => ({ data: [] })),
        axios.get(`${API}/zetachain/omnichain-pools`).catch(() => ({ data: [] })),
        axios.get(`${API}/zetachain/supported-chains`).catch(() => ({ data: { chains: [] } }))
      ]);

      setApiStatus(apiStatusRes.data);
      setZetachainStatus(zetachainStatusRes.data);
      setAnalytics(analyticsRes.data);
      setPools(poolsRes.data);
      setPortfolio(portfolioRes.data);
      setArbitrage(arbitrageRes.data);
      setChains(chainsRes.data);
      setProtocols(protocolsRes.data);
      setZetaPools(zetaPoolsRes.data);
      setSupportedChains(supportedChainsRes.data.chains || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const getChainIcon = (chainId) => {
    const chain = chains.find(c => c.id === chainId);
    return chain?.logo || '';
  };

  const getProtocolIcon = (protocolId) => {
    const protocol = protocols.find(p => p.id === protocolId);
    return protocol?.logo || '';
  };

  const formatAddress = (address) => {
    if (!address) return '';
    if (address.length <= 10) return address;
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const formatRewardAddress = (address) => {
    if (!address) return '';
    if (address.length <= 16) return address;
    return `${address.slice(0, 10)}...${address.slice(-6)}`;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here if needed
      console.log('Address copied to clipboard:', text);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const createCrossChainTransaction = async (fromChain, toChain, amount, token) => {
    try {
      const response = await axios.post(`${API}/zetachain/cross-chain-transaction`, {
        from_chain: fromChain,
        to_chain: toChain,
        amount: amount,
        token: token
      });
      setCrossChainTx(response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating cross-chain transaction:', error);
      return null;
    }
  };

  const getTokenLogo = (tokenSymbol) => {
    // Mapping token symbols to their official logos
    const tokenLogos = {
      'ETH': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/eth.png',
      'BTC': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/btc.png',
      'WBTC': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/wbtc.png',
      'USDC': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/usdc.png',
      'USDT': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/usdt.png',
      'DAI': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/dai.png',
      'MATIC': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/matic.png',
      'AVAX': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/avax.png',
      'BNB': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/bnb.png',
      'BUSD': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/busd.png',
      'LINK': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/link.png',
      'UNI': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/uni.png',
      'AAVE': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/aave.png',
      'COMP': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/comp.png',
      'CRV': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/crv.png',
      'CAKE': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/cake.png',
      'ZETA': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/zeta.png',
      'ARB': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/arb.png',
      'OP': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/op.png',
      'SOL': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/sol.png',
      'ADA': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/ada.png',
      'DOT': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/dot.png',
      'SHIB': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/shib.png',
      'DOGE': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/doge.png',
      'LTC': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/ltc.png',
      'BCH': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/bch.png',
      'XRP': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/xrp.png',
      'TRX': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/trx.png',
      'ATOM': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/atom.png',
      'NEAR': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/near.png',
      'FTM': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/ftm.png',
      'ALGO': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/algo.png',
      'VET': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/vet.png',
      'ICP': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/icp.png',
      'FIL': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/fil.png',
      'THETA': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/theta.png',
      'EOS': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/eos.png',
      'XTZ': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/xtz.png',
      'KSM': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/ksm.png',
      'FLOW': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/flow.png',
      'MANA': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/mana.png',
      'SAND': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/sand.png',
      'AXS': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/axs.png',
      'CHZ': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/chz.png',
      'ENJ': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/enj.png',
      'BAT': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/bat.png',
      'ZRX': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/zrx.png',
      'MKR': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/mkr.png',
      'SNX': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/snx.png',
      'YFI': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/yfi.png',
      'SUSHI': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/sushi.png',
      '1INCH': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/1inch.png',
      'BAL': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/bal.png',
      'LRC': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/lrc.png',
      'KNC': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/knc.png',
      'REN': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/ren.png',
      'STORJ': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/storj.png',
      'REP': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/rep.png',
      'LEND': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/lend.png',
      'KAVA': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/kava.png',
      'BAND': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/band.png',
      'NMR': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/nmr.png',
      'CGLD': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/cgld.png',
      'UMA': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/uma.png',
      'LINA': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/lina.png',
      'PERP': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/perp.png',
      'RLC': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/rlc.png',
      'BADGER': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/badger.png',
      'FARM': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/farm.png',
      'BOND': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/bond.png',
      'KP3R': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/kp3r.png',
      'ALPHA': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/alpha.png',
      'ROOK': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/rook.png',
      'QUICK': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/quick.png',
      'RDNT': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/rdnt.png',
      'FRAX': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/frax.png',
      'FXS': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/fxs.png',
      'LQTY': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/lqty.png',
      'LUSD': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/lusd.png',
      'CVX': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/cvx.png',
      '3CRV': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/3crv.png',
      'GUSD': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/gusd.png',
      'SUSD': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/susd.png',
      'MUSD': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/musd.png',
      'RSV': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/rsv.png',
      'DUSD': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/dusd.png',
      'TUSD': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/tusd.png',
      'USDP': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/usdp.png',
    };

    return tokenLogos[tokenSymbol] || `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/${tokenSymbol.toLowerCase()}.png`;
  };

  const getRiskColor = (risk) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPools = selectedChain === 'all'
    ? pools
    : pools.filter(pool => pool.chain_id === selectedChain);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Omnichain Data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Ω</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white" data-testid="app-title">OmniYield</h1>
                <p className="text-gray-400 text-sm">Cross-Chain Yield Farming Aggregator</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Badge className={`${apiStatus?.zetachain_connected ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                  {apiStatus?.zetachain_connected ? '✅' : '❌'} ZetaChain
                </Badge>
                <Badge className={`${apiStatus?.database_connected ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                  {apiStatus?.database_connected ? '✅' : '❌'} Database
                </Badge>
              </div>
              <WalletConnect />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-black/40 border-gray-700 backdrop-blur-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Value Locked</p>
                    <p className="text-3xl font-bold text-white" data-testid="total-tvl">
                      ${analytics.total_value_locked.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    💰
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-gray-700 backdrop-blur-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Rewards</p>
                    <p className="text-3xl font-bold text-green-400" data-testid="total-rewards">
                      +${analytics.total_rewards_earned.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    📈
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-gray-700 backdrop-blur-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Average APY</p>
                    <p className="text-3xl font-bold text-purple-400" data-testid="avg-apy">
                      {analytics.average_apy}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    ⚡
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-gray-700 backdrop-blur-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Chains</p>
                    <p className="text-3xl font-bold text-orange-400" data-testid="active-chains">
                      {analytics.chains_count}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    🔗
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="pools" className="space-y-6">
          <TabsList className="bg-black/40 border-gray-700 backdrop-blur-lg">
            <TabsTrigger value="pools" className="data-[state=active]:bg-white/10" data-testid="pools-tab">
              🏊 Yield Pools
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-white/10" data-testid="portfolio-tab">
              💼 My Portfolio
            </TabsTrigger>
            <TabsTrigger value="arbitrage" className="data-[state=active]:bg-white/10" data-testid="arbitrage-tab">
              ⚡ Arbitrage
            </TabsTrigger>
            <TabsTrigger value="optimizer" className="data-[state=active]:bg-white/10" data-testid="optimizer-tab">
              🎯 AI Optimizer
            </TabsTrigger>
            <TabsTrigger value="zetachain" className="data-[state=active]:bg-white/10" data-testid="zetachain-tab">
              ⛓️ ZetaChain
            </TabsTrigger>
            <TabsTrigger value="status" className="data-[state=active]:bg-white/10" data-testid="status-tab">
              📊 Network Status
            </TabsTrigger>
          </TabsList>

          {/* Yield Pools Tab */}
          <TabsContent value="pools" className="space-y-6">
            <Card className="bg-black/40 border-gray-700 backdrop-blur-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">🏊 Best Yield Opportunities</CardTitle>
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedChain}
                      onChange={(e) => setSelectedChain(e.target.value)}
                      className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600"
                      data-testid="chain-filter"
                    >
                      <option value="all">All Chains</option>
                      {chains.map(chain => (
                        <option key={chain.id} value={chain.id}>{chain.name}</option>
                      ))}
                    </select>
                    <Button className="bg-blue-600 hover:bg-blue-700" data-testid="refresh-pools-btn">
                      🔄 Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPools.slice(0, 12).map((pool) => (
                    <Card key={pool.id} className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 border-slate-700/60 backdrop-blur-lg hover:border-slate-600/60 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 group">
                      <CardContent className="p-6">
                        {/* Header Section */}
                        <div className="flex items-start justify-between mb-5">
                          <div className="flex items-center space-x-3">
                            <div className="flex -space-x-2">
                              <img
                                src={getProtocolIcon(pool.protocol_id)}
                                alt={pool.protocol_id}
                                className="w-8 h-8 rounded-full border-2 border-slate-700 group-hover:border-slate-600 transition-colors"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                              <img
                                src={getChainIcon(pool.chain_id)}
                                alt={pool.chain_id}
                                className="w-8 h-8 rounded-full border-2 border-slate-700 group-hover:border-slate-600 transition-colors"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-white font-semibold text-sm truncate" data-testid={`pool-name-${pool.id}`}>
                                {pool.name}
                              </h3>
                              <p className="text-slate-400 text-xs truncate">{pool.symbol}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1.5">
                            <Badge className={`text-xs px-3 py-1.5 font-medium ${pool.il_risk === 'Low' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                              pool.il_risk === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                'bg-red-500/20 text-red-400 border-red-500/30'
                              }`}>
                              {pool.il_risk}
                            </Badge>
                            {pool.auto_compound && (
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs px-3 py-1.5 font-medium">
                                Auto
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Token Pair Display */}
                        <div className="flex items-center justify-center mb-5">
                          <div className="flex items-center space-x-3 bg-slate-800/50 rounded-full px-4 py-2.5 border border-slate-700/50">
                            <div className="flex items-center space-x-2">
                              <img
                                src={getTokenLogo(pool.token0)}
                                alt={pool.token0}
                                className="w-6 h-6 rounded-full border border-slate-600"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                              <span className="text-white text-sm font-medium">{pool.token0}</span>
                            </div>
                            <span className="text-slate-400 text-sm font-medium">/</span>
                            <div className="flex items-center space-x-2">
                              <img
                                src={getTokenLogo(pool.token1)}
                                alt={pool.token1}
                                className="w-6 h-6 rounded-full border border-slate-600"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                              <span className="text-white text-sm font-medium">{pool.token1}</span>
                            </div>
                          </div>
                        </div>

                        {/* Metrics Section */}
                        <div className="space-y-4 mb-5">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm font-medium">APY</span>
                            <span className="text-emerald-400 font-bold text-xl" data-testid={`pool-apy-${pool.id}`}>
                              {pool.apy}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm font-medium">TVL</span>
                            <span className="text-white font-semibold text-lg">${(pool.tvl_usd / 1000000).toFixed(1)}M</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm font-medium">Volume (24h)</span>
                            <span className="text-white font-semibold text-lg">${(pool.daily_volume_usd / 1000000).toFixed(1)}M</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm font-medium">Risk Score</span>
                            <div className="flex items-center space-x-3">
                              <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${pool.risk_score <= 3 ? 'bg-emerald-500' :
                                    pool.risk_score <= 6 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                  style={{ width: `${(pool.risk_score / 10) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-white font-semibold text-sm min-w-[2rem]">{pool.risk_score.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Rewards Section */}
                        <div className="mb-5">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-slate-400 text-sm font-medium">Rewards</span>
                          </div>
                          <div className="flex items-center space-x-2 flex-wrap gap-2">
                            {pool.rewards_tokens.map((token, index) => (
                              <div key={`${token}-${index}`} className="flex items-center space-x-1.5 bg-purple-500/10 text-purple-300 text-xs font-mono px-3 py-2 rounded-lg border border-purple-500/20 hover:bg-purple-500/20 transition-colors group/reward">
                                <img
                                  src={getTokenLogo(token)}
                                  alt={token}
                                  className="w-4 h-4 rounded-full border border-purple-400/30"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <span className="truncate max-w-20" title={`Full address: ${token}`}>
                                  {formatRewardAddress(token)}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(token)}
                                  className="flex-shrink-0 hover:bg-purple-500/30 rounded p-1 transition-colors opacity-70 group-hover/reward:opacity-100"
                                  title="Copy address"
                                >
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02]"
                          data-testid={`deposit-btn-${pool.id}`}
                        >
                          <span className="flex items-center justify-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Deposit</span>
                          </span>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card className="bg-black/40 border-gray-700 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">💼 My Cross-Chain Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {portfolio.map((position) => (
                    <div key={position.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      {/* Header Section */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <img src={getChainIcon(position.chain_id)} alt="" className="w-6 h-6 rounded-full" />
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold text-sm" data-testid={`position-value-${position.id}`}>
                              ${position.current_value_usd.toLocaleString()}
                            </p>
                            <p className={`text-xs ${position.rewards_earned_usd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {position.rewards_earned_usd >= 0 ? '+' : ''}${position.rewards_earned_usd.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Position Name and Token Pair */}
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm truncate" data-testid={`position-${position.id}`}>
                              {position.symbol || `Position #${position.id.slice(0, 8)}`}
                            </p>
                            <p className="text-gray-400 text-xs truncate">
                              {chains.find(c => c.id === position.chain_id)?.name}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            <img src={getTokenLogo(position.token0)} alt={position.token0} className="w-5 h-5 rounded-full" />
                            <img src={getTokenLogo(position.token1)} alt={position.token1} className="w-5 h-5 rounded-full" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <p className="text-gray-400 text-xs">Deposited</p>
                          <p className="text-white text-sm">${position.deposited_amount_usd.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">APY Earned</p>
                          <p className="text-purple-400 font-semibold text-sm">{position.apy_earned}%</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Last Compound</p>
                          <p className="text-white text-sm">
                            {new Date(position.last_compound).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Performance</p>
                          <Progress
                            value={(position.current_value_usd / position.deposited_amount_usd - 1) * 100}
                            className="w-full h-2"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300" data-testid={`compound-btn-${position.id}`}>
                          Compound
                        </Button>
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300" data-testid={`withdraw-btn-${position.id}`}>
                          Withdraw
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Arbitrage Tab */}
          <TabsContent value="arbitrage" className="space-y-6">
            <Card className="bg-black/40 border-gray-700 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">⚡ Cross-Chain Arbitrage Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {arbitrage.map((opp) => (
                    <div key={opp.id} className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-700/50">
                      {/* Header Section */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <img src={getTokenLogo(opp.token_symbol)} alt={opp.token_symbol} className="w-6 h-6 rounded-full" />
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 font-bold text-sm" data-testid={`arbitrage-profit-${opp.id}`}>
                              +${opp.net_profit_usd}
                            </p>
                            <p className="text-green-300 text-xs">
                              {opp.profit_percentage}% profit
                            </p>
                          </div>
                        </div>

                        {/* Arbitrage Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm truncate" data-testid={`arbitrage-${opp.id}`}>
                              {opp.token_symbol} Arbitrage
                            </p>
                            <p className="text-gray-400 text-xs truncate">
                              {chains.find(c => c.id === opp.source_chain)?.name} → {chains.find(c => c.id === opp.dest_chain)?.name}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <p className="text-gray-400 text-xs">Source Price</p>
                          <p className="text-white text-sm">${opp.source_price}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Dest Price</p>
                          <p className="text-white text-sm">${opp.dest_price}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Gas Cost</p>
                          <p className="text-orange-400 text-sm">${opp.gas_cost_usd}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Expires</p>
                          <p className="text-red-400 text-xs">
                            {Math.round((new Date(opp.expires_at) - new Date()) / 60000)}m
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" data-testid={`execute-arbitrage-${opp.id}`}>
                          Execute Trade
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Optimizer Tab */}
          <TabsContent value="optimizer" className="space-y-6">
            <Card className="bg-black/40 border-gray-700 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">🎯 AI Yield Optimizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-blue-700/50">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">ZetaChain Universal Strategy</h3>
                    <p className="text-gray-400">AI-powered cross-chain yield optimization</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-semibold mb-3">Optimal Allocation</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Ethereum</span>
                          <span className="text-white font-semibold">35%</span>
                        </div>
                        <Progress value={35} className="h-2" />

                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Polygon</span>
                          <span className="text-white font-semibold">25%</span>
                        </div>
                        <Progress value={25} className="h-2" />

                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">BSC</span>
                          <span className="text-white font-semibold">20%</span>
                        </div>
                        <Progress value={20} className="h-2" />

                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Arbitrum</span>
                          <span className="text-white font-semibold">15%</span>
                        </div>
                        <Progress value={15} className="h-2" />

                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Avalanche</span>
                          <span className="text-white font-semibold">5%</span>
                        </div>
                        <Progress value={5} className="h-2" />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-3">Strategy Metrics</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Expected APY</span>
                          <span className="text-green-400 font-bold">15.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Risk Score</span>
                          <span className="text-yellow-400 font-bold">4.2/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Gas Savings</span>
                          <span className="text-blue-400 font-bold">$127/month</span>
                        </div>
                        <Separator className="bg-gray-700" />
                        <div className="space-y-2">
                          <p className="text-gray-400 text-sm">AI Recommendations:</p>
                          <ul className="text-gray-300 text-sm space-y-1">
                            <li>• Increase Polygon allocation for lower fees</li>
                            <li>• Auto-compound every 3 days optimal</li>
                            <li>• Diversify to reduce IL risk</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8"
                      data-testid="apply-strategy-btn"
                    >
                      Apply Strategy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ZetaChain Tab */}
          <TabsContent value="zetachain" className="space-y-6">
            <Card className="bg-black/40 border-gray-700 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">⛓️ ZetaChain Omnichain Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ZetaChain Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-4 rounded-lg border border-purple-500/30">
                    <h3 className="text-white font-semibold mb-2">🌐 Network Status</h3>
                    {zetachainStatus?.connected ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <span className="text-green-400">✅ Connected</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Network:</span>
                          <span className="text-white">{zetachainStatus.network_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Type:</span>
                          <span className={`${zetachainStatus.network_type === 'mainnet' ? 'text-green-400' : 'text-yellow-400'}`}>
                            {zetachainStatus.network_type?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Chain ID:</span>
                          <span className="text-white">{zetachainStatus.chain_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Latest Block:</span>
                          <span className="text-white">{zetachainStatus.latest_block?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Gas Price:</span>
                          <span className="text-white">{zetachainStatus.gas_price_gwei} Gwei</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-red-400">❌ Not Connected</div>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-4 rounded-lg border border-green-500/30">
                    <h3 className="text-white font-semibold mb-2">🔗 Supported Chains</h3>
                    <div className="space-y-1">
                      {supportedChains.slice(0, 4).map((chain, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-400">{chain.name}:</span>
                          <span className="text-white">{chain.symbol}</span>
                        </div>
                      ))}
                      {supportedChains.length > 4 && (
                        <div className="text-gray-400 text-sm">+{supportedChains.length - 4} more chains</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cross-Chain Transaction Demo */}
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 rounded-lg border border-blue-500/30">
                  <h3 className="text-white font-semibold mb-4">🚀 Cross-Chain Transaction Demo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">From Chain</label>
                      <select className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white">
                        <option value="ethereum">Ethereum</option>
                        <option value="bsc">BSC</option>
                        <option value="polygon">Polygon</option>
                        <option value="zetachain">ZetaChain</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">To Chain</label>
                      <select className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white">
                        <option value="zetachain">ZetaChain</option>
                        <option value="ethereum">Ethereum</option>
                        <option value="bsc">BSC</option>
                        <option value="polygon">Polygon</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Amount</label>
                      <input
                        type="number"
                        placeholder="100"
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Token</label>
                      <select className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white">
                        <option value="ZETA">ZETA</option>
                        <option value="ETH">ETH</option>
                        <option value="USDC">USDC</option>
                        <option value="USDT">USDT</option>
                      </select>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => createCrossChainTransaction('ethereum', 'zetachain', 100, 'ETH')}
                  >
                    🚀 Execute Cross-Chain Transaction
                  </Button>

                  {crossChainTx && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
                      <h4 className="text-white font-semibold mb-2">Transaction Details</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">TX Hash:</span>
                          <span className="text-white font-mono">{formatRewardAddress(crossChainTx.tx_hash)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <span className="text-yellow-400">{crossChainTx.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Cross-Chain Fee:</span>
                          <span className="text-white">{crossChainTx.cross_chain_fee} {crossChainTx.token}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Processing Time:</span>
                          <span className="text-white">{Math.round(crossChainTx.processing_time_seconds / 60)} minutes</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ZetaChain Omnichain Pools */}
                <div>
                  <h3 className="text-white font-semibold mb-4">🏊 ZetaChain Omnichain Pools</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {zetaPools.slice(0, 8).map((pool) => (
                      <Card key={pool.id} className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30 backdrop-blur-lg">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <img
                                src={getTokenLogo(pool.token0)}
                                alt={pool.token0}
                                className="w-6 h-6 rounded-full"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                              <img
                                src={getTokenLogo(pool.token1)}
                                alt={pool.token1}
                                className="w-6 h-6 rounded-full"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            </div>
                            <Badge className="bg-purple-600 text-white text-xs">
                              {pool.protocol}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-sm">Pool:</span>
                              <span className="text-white text-sm font-medium">{pool.symbol}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-sm">Omnichain APY:</span>
                              <span className="text-green-400 font-semibold">{pool.omnichain_apy.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-sm">TVL:</span>
                              <span className="text-white text-sm">${(pool.tvl_usd / 1000000).toFixed(1)}M</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-sm">Cross-Chain Fee:</span>
                              <span className="text-white text-sm">{pool.cross_chain_fee}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-sm">Risk Score:</span>
                              <span className="text-white text-sm">{pool.risk_score}</span>
                            </div>
                          </div>

                          <Button className="w-full mt-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm">
                            🚀 Deposit
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Network Status Tab */}
          <TabsContent value="status" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* API Status */}
              <Card className="bg-black/40 border-gray-700 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white">🔗 API Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Backend API</span>
                      <Badge className={apiStatus?.error ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                        {apiStatus?.error ? '❌ Offline' : '✅ Online'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">ZetaChain Connection</span>
                      <Badge className={apiStatus?.zetachain_connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {apiStatus?.zetachain_connected ? '✅ Connected' : '❌ Disconnected'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Database</span>
                      <Badge className={apiStatus?.database_connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {apiStatus?.database_connected ? '✅ Connected' : '❌ Disconnected'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Supported Chains</span>
                      <span className="text-white">{apiStatus?.supported_chains?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ZetaChain Status */}
              <Card className="bg-black/40 border-gray-700 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white">⚡ ZetaChain Network</CardTitle>
                </CardHeader>
                <CardContent>
                  {zetachainStatus?.error ? (
                    <div className="text-red-400">
                      <p>❌ {zetachainStatus.error}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Network</span>
                        <span className="text-white">{zetachainStatus?.network_name || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Chain ID</span>
                        <span className="text-white">{zetachainStatus?.chain_id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Latest Block</span>
                        <span className="text-white">{zetachainStatus?.latest_block?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Gas Price</span>
                        <span className="text-white">{zetachainStatus?.gas_price_gwei?.toFixed(2 || 'N/A')} Gwei</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Block Time</span>
                        <span className="text-white">{config.ZETACHAIN.BLOCK_TIME}s</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Wallet Information */}
            {isConnected && (
              <Card className="bg-black/40 border-gray-700 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white">👛 Wallet Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Address</span>
                      <span className="text-white font-mono text-sm" title={address}>
                        {formatAddress(address)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Status</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        ✅ Connected
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Refresh Button */}
            <div className="text-center">
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={fetchData}
              >
                🔄 Refresh Status
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

function App() {
  return (
    <WalletProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </div>
    </WalletProvider>
  );
}

export default App;