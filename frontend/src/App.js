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
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState(null);
  const [zetachainStatus, setZetachainStatus] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apiStatusRes, zetachainStatusRes, analyticsRes, poolsRes, portfolioRes, arbitrageRes, chainsRes, protocolsRes] = await Promise.all([
        axios.get(`${API}/`).catch(() => ({ data: { error: 'API not available' } })),
        axios.get(`${API}/zetachain/status`).catch(() => ({ data: { error: 'ZetaChain not available' } })),
        axios.get(`${API}/analytics/overview`).catch(() => ({ data: null })),
        axios.get(`${API}/pools`).catch(() => ({ data: [] })),
        axios.get(`${API}/portfolio`).catch(() => ({ data: [] })),
        axios.get(`${API}/arbitrage`).catch(() => ({ data: [] })),
        axios.get(`${API}/chains`).catch(() => ({ data: [] })),
        axios.get(`${API}/protocols`).catch(() => ({ data: [] }))
      ]);

      setApiStatus(apiStatusRes.data);
      setZetachainStatus(zetachainStatusRes.data);
      setAnalytics(analyticsRes.data);
      setPools(poolsRes.data);
      setPortfolio(portfolioRes.data);
      setArbitrage(arbitrageRes.data);
      setChains(chainsRes.data);
      setProtocols(protocolsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts.length > 0) {
          const address = accounts[0];
          setWalletAddress(address);
          setWalletConnected(true);
          
          // Fetch wallet balance
          try {
            const balanceRes = await axios.get(`${API}/zetachain/balance/${address}`);
            setWalletBalance(balanceRes.data);
          } catch (error) {
            console.error('Error fetching wallet balance:', error);
          }
        }
      } else {
        alert('Please install MetaMask or another Web3 wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
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

  const getRiskColor = (risk) => {
    switch(risk.toLowerCase()) {
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
              {walletConnected ? (
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </Badge>
                  {walletBalance && (
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {walletBalance.balance_zeta.toFixed(2)} ZETA
                    </Badge>
                  )}
                </div>
              ) : (
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                  data-testid="connect-wallet-btn"
                  onClick={connectWallet}
                >
                  Connect Wallet
                </Button>
              )}
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
                <div className="space-y-4">
                  {filteredPools.slice(0, 8).map((pool) => (
                    <div key={pool.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <img src={getProtocolIcon(pool.protocol_id)} alt="" className="w-8 h-8 rounded-full" />
                          <img src={getChainIcon(pool.chain_id)} alt="" className="w-6 h-6 rounded-full" />
                          <div>
                            <p className="text-white font-semibold" data-testid={`pool-name-${pool.id}`}>
                              {pool.name}
                            </p>
                            <p className="text-gray-400 text-sm">{pool.symbol}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={getRiskColor(pool.il_risk)}>
                            {pool.il_risk} Risk
                          </Badge>
                          {pool.auto_compound && (
                            <Badge className="bg-blue-100 text-blue-800">Auto-Compound</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-gray-400 text-xs">APY</p>
                          <p className="text-green-400 font-bold text-lg" data-testid={`pool-apy-${pool.id}`}>
                            {pool.apy}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">TVL</p>
                          <p className="text-white font-semibold">
                            ${(pool.tvl_usd / 1000000).toFixed(1)}M
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Volume (24h)</p>
                          <p className="text-white font-semibold">
                            ${(pool.daily_volume_usd / 1000000).toFixed(1)}M
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Risk Score</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={pool.risk_score * 10} className="w-16 h-2" />
                            <span className="text-white text-sm">{pool.risk_score.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 text-sm">Rewards:</span>
                          {pool.rewards_tokens.map((token) => (
                            <Badge key={token} className="bg-purple-100 text-purple-800 text-xs">
                              {token}
                            </Badge>
                          ))}
                        </div>
                        <Button 
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          data-testid={`deposit-btn-${pool.id}`}
                        >
                          Deposit
                        </Button>
                      </div>
                    </div>
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
                <div className="space-y-4">
                  {portfolio.map((position) => (
                    <div key={position.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <img src={getChainIcon(position.chain_id)} alt="" className="w-8 h-8 rounded-full" />
                          <div>
                            <p className="text-white font-semibold" data-testid={`position-${position.id}`}>
                              Position #{position.id.slice(0, 8)}
                            </p>
                            <p className="text-gray-400 text-sm">
                              Chain: {chains.find(c => c.id === position.chain_id)?.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold text-lg" data-testid={`position-value-${position.id}`}>
                            ${position.current_value_usd.toLocaleString()}
                          </p>
                          <p className={`text-sm ${position.rewards_earned_usd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {position.rewards_earned_usd >= 0 ? '+' : ''}${position.rewards_earned_usd.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-gray-400 text-xs">Deposited</p>
                          <p className="text-white">${position.deposited_amount_usd.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">APY Earned</p>
                          <p className="text-purple-400 font-semibold">{position.apy_earned}%</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Last Compound</p>
                          <p className="text-white text-sm">
                            {new Date(position.last_compound).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Progress 
                          value={(position.current_value_usd / position.deposited_amount_usd - 1) * 100} 
                          className="w-32 h-2" 
                        />
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300" data-testid={`compound-btn-${position.id}`}>
                            Compound
                          </Button>
                          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300" data-testid={`withdraw-btn-${position.id}`}>
                            Withdraw
                          </Button>
                        </div>
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
                <div className="space-y-4">
                  {arbitrage.map((opp) => (
                    <div key={opp.id} className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-700/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                            {opp.token_symbol.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-semibold" data-testid={`arbitrage-${opp.id}`}>
                              {opp.token_symbol} Arbitrage
                            </p>
                            <p className="text-gray-400 text-sm">
                              {chains.find(c => c.id === opp.source_chain)?.name} → {chains.find(c => c.id === opp.dest_chain)?.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold text-lg" data-testid={`arbitrage-profit-${opp.id}`}>
                            +${opp.net_profit_usd}
                          </p>
                          <p className="text-green-300 text-sm">
                            {opp.profit_percentage}% profit
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-gray-400 text-xs">Source Price</p>
                          <p className="text-white">${opp.source_price}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Dest Price</p>
                          <p className="text-white">${opp.dest_price}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Gas Cost</p>
                          <p className="text-orange-400">${opp.gas_cost_usd}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Expires</p>
                          <p className="text-red-400 text-sm">
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
            {walletConnected && (
              <Card className="bg-black/40 border-gray-700 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white">👛 Wallet Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Address</span>
                      <span className="text-white font-mono text-sm">{walletAddress}</span>
                    </div>
                    {walletBalance && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">ZETA Balance</span>
                          <span className="text-white">{walletBalance.balance_zeta.toFixed(4)} ZETA</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">USD Value</span>
                          <span className="text-white">${walletBalance.balance_usd.toFixed(2)}</span>
                        </div>
                      </>
                    )}
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
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;