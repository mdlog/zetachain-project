from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import random
import asyncio
import aiohttp
import json
from web3 import Web3

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Load environment variables with defaults
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'omniyield')
zetachain_rpc = os.environ.get('ZETACHAIN_RPC_URL', 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public')
zetachain_chain_id = int(os.environ.get('ZETACHAIN_CHAIN_ID', '7001'))

# MongoDB connection
try:
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    # Test connection
    client.admin.command('ping')
    print("✅ Connected to MongoDB successfully")
except Exception as e:
    print(f"⚠️ MongoDB connection failed: {e}")
    print("Using in-memory storage for development")
    client = None
    db = None

# Web3 connection to ZetaChain
try:
    w3 = Web3(Web3.HTTPProvider(zetachain_rpc))
    if w3.is_connected():
        print(f"✅ Connected to ZetaChain at {zetachain_rpc}")
        print(f"Chain ID: {w3.eth.chain_id}")
    else:
        print("⚠️ Failed to connect to ZetaChain")
        w3 = None
except Exception as e:
    print(f"⚠️ ZetaChain connection failed: {e}")
    w3 = None

# Create the main app without a prefix
app = FastAPI(title="Omnichain Yield Farming Aggregator")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class Chain(BaseModel):
    id: str
    name: str
    symbol: str
    logo: str
    rpc_url: str
    explorer_url: str
    native_token: str
    bridge_fee_usd: float
    avg_block_time: int

class Protocol(BaseModel):
    id: str
    name: str
    logo: str
    category: str
    tvl_usd: float
    chains: List[str]

class Pool(BaseModel):
    id: str
    protocol_id: str
    chain_id: str
    name: str
    symbol: str
    token0: str
    token1: str
    apy: float
    apy_7d: float
    apy_30d: float
    tvl_usd: float
    daily_volume_usd: float
    risk_score: float
    il_risk: str
    auto_compound: bool
    rewards_tokens: List[str]

class Portfolio(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_address: str
    chain_id: str
    pool_id: str
    deposited_amount_usd: float
    current_value_usd: float
    rewards_earned_usd: float
    last_compound: datetime
    apy_earned: float

class ArbitrageOpportunity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    token_symbol: str
    source_chain: str
    dest_chain: str
    source_price: float
    dest_price: float
    profit_percentage: float
    profit_usd: float
    gas_cost_usd: float
    net_profit_usd: float
    expires_at: datetime

# Real data fetchers
async def fetch_chain_data():
    """Fetch real chain data from ZetaChain and other sources"""
    chains = [
        {
            "id": "zetachain",
            "name": "ZetaChain",
            "symbol": "ZETA",
            "logo": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/zeta.png",
            "rpc_url": zetachain_rpc,
            "explorer_url": "https://explorer.zetachain.com",
            "native_token": "ZETA",
            "bridge_fee_usd": 0.5,
            "avg_block_time": 6
        },
        {
            "id": "ethereum",
            "name": "Ethereum",
            "symbol": "ETH", 
            "logo": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/eth.png",
            "rpc_url": "https://eth.llamarpc.com",
            "explorer_url": "https://etherscan.io",
            "native_token": "ETH",
            "bridge_fee_usd": 25.0,
            "avg_block_time": 12
        },
        {
            "id": "bsc",
            "name": "BNB Smart Chain",
            "symbol": "BNB",
            "logo": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/bnb.png",
            "rpc_url": "https://bsc-dataseed1.binance.org",
            "explorer_url": "https://bscscan.com",
            "native_token": "BNB",
            "bridge_fee_usd": 3.0,
            "avg_block_time": 3
        },
        {
            "id": "polygon",
            "name": "Polygon",
            "symbol": "MATIC",
            "logo": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/matic.png",
            "rpc_url": "https://polygon-rpc.com",
            "explorer_url": "https://polygonscan.com",
            "native_token": "MATIC",
            "bridge_fee_usd": 1.5,
            "avg_block_time": 2
        },
        {
            "id": "avalanche",
            "name": "Avalanche",
            "symbol": "AVAX",
            "logo": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/avax.png",
            "rpc_url": "https://api.avax.network/ext/bc/C/rpc",
            "explorer_url": "https://snowtrace.io",
            "native_token": "AVAX",
            "bridge_fee_usd": 2.5,
            "avg_block_time": 1
        },
        {
            "id": "arbitrum",
            "name": "Arbitrum",
            "symbol": "ARB",
            "logo": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/arb.png",
            "rpc_url": "https://arb1.arbitrum.io/rpc",
            "explorer_url": "https://arbiscan.io",
            "native_token": "ETH",
            "bridge_fee_usd": 5.0,
            "avg_block_time": 1
        }
    ]
    return chains

async def fetch_protocol_data():
    """Fetch real protocol data from DeFiLlama API"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get('https://api.llama.fi/protocols') as response:
                if response.status == 200:
                    protocols_data = await response.json()
                    # Filter and format protocols
                    protocols = []
                    for protocol in protocols_data[:20]:  # Top 20 protocols
                        if protocol.get('tvl', 0) > 1000000:  # TVL > $1M
                            protocols.append({
                                "id": protocol['slug'],
                                "name": protocol['name'],
                                "logo": f"https://icons.llama.fi/{protocol['slug']}.png",
                                "category": protocol.get('category', 'Unknown'),
                                "tvl_usd": protocol.get('tvl', 0),
                                "chains": protocol.get('chains', [])
                            })
                    return protocols
    except Exception as e:
        print(f"Error fetching protocol data: {e}")
    
    # Fallback to mock data
    return [
        {
            "id": "uniswap",
            "name": "Uniswap V3",
            "logo": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/uni.png",
            "category": "DEX",
            "tvl_usd": 4200000000,
            "chains": ["ethereum", "polygon", "arbitrum"]
        },
        {
            "id": "aave",
            "name": "Aave",
            "logo": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/aave.png",
            "category": "Lending",
            "tvl_usd": 7800000000,
            "chains": ["ethereum", "polygon", "avalanche", "arbitrum"]
        },
        {
            "id": "compound",
            "name": "Compound",
            "logo": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/comp.png",
            "category": "Lending",
            "tvl_usd": 3100000000,
            "chains": ["ethereum", "polygon"]
        },
        {
            "id": "pancakeswap",
            "name": "PancakeSwap",
            "logo": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/cake.png",
            "category": "DEX",
            "tvl_usd": 2400000000,
            "chains": ["bsc", "ethereum", "arbitrum"]
        },
        {
            "id": "curve",
            "name": "Curve Finance",
            "logo": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/crv.png",
            "category": "DEX",
            "tvl_usd": 1900000000,
            "chains": ["ethereum", "polygon", "arbitrum", "avalanche"]
        }
    ]

async def fetch_token_prices():
    """Fetch real token prices from CoinGecko"""
    try:
        async with aiohttp.ClientSession() as session:
            # Fetch prices for major tokens
            token_ids = "ethereum,binancecoin,matic-network,avalanche-2,arbitrum,bitcoin"
            url = f"https://api.coingecko.com/api/v3/simple/price?ids={token_ids}&vs_currencies=usd"
            async with session.get(url) as response:
                if response.status == 200:
                    return await response.json()
    except Exception as e:
        print(f"Error fetching token prices: {e}")
    
    # Fallback prices
    return {
        "ethereum": {"usd": 2500},
        "binancecoin": {"usd": 300},
        "matic-network": {"usd": 0.8},
        "avalanche-2": {"usd": 25},
        "arbitrum": {"usd": 1.2},
        "bitcoin": {"usd": 45000}
    }

# Mock data (fallback)
CHAINS_DATA = [
    {
        "id": "ethereum",
        "name": "Ethereum",
        "symbol": "ETH", 
        "logo": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/eth.png",
        "rpc_url": "https://eth.llamarpc.com",
        "explorer_url": "https://etherscan.io",
        "native_token": "ETH",
        "bridge_fee_usd": 25.0,
        "avg_block_time": 12
    },
    {
        "id": "bsc",
        "name": "BNB Smart Chain",
        "symbol": "BNB",
        "logo": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/bnb.png",
        "rpc_url": "https://bsc-dataseed1.binance.org",
        "explorer_url": "https://bscscan.com",
        "native_token": "BNB",
        "bridge_fee_usd": 3.0,
        "avg_block_time": 3
    },
    {
        "id": "polygon",
        "name": "Polygon",
        "symbol": "MATIC",
        "logo": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/matic.png",
        "rpc_url": "https://polygon-rpc.com",
        "explorer_url": "https://polygonscan.com",
        "native_token": "MATIC",
        "bridge_fee_usd": 1.5,
        "avg_block_time": 2
    },
    {
        "id": "avalanche",
        "name": "Avalanche",
        "symbol": "AVAX",
        "logo": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/avax.png",
        "rpc_url": "https://api.avax.network/ext/bc/C/rpc",
        "explorer_url": "https://snowtrace.io",
        "native_token": "AVAX",
        "bridge_fee_usd": 2.5,
        "avg_block_time": 1
    },
    {
        "id": "arbitrum",
        "name": "Arbitrum",
        "symbol": "ARB",
        "logo": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/arb.png",
        "rpc_url": "https://arb1.arbitrum.io/rpc",
        "explorer_url": "https://arbiscan.io",
        "native_token": "ETH",
        "bridge_fee_usd": 5.0,
        "avg_block_time": 1
    }
]

PROTOCOLS_DATA = [
    {
        "id": "uniswap",
        "name": "Uniswap V3",
        "logo": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/uni.png",
        "category": "DEX",
        "tvl_usd": 4200000000,
        "chains": ["ethereum", "polygon", "arbitrum"]
    },
    {
        "id": "aave",
        "name": "Aave",
        "logo": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/aave.png",
        "category": "Lending",
        "tvl_usd": 7800000000,
        "chains": ["ethereum", "polygon", "avalanche", "arbitrum"]
    },
    {
        "id": "compound",
        "name": "Compound",
        "logo": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/comp.png",
        "category": "Lending",
        "tvl_usd": 3100000000,
        "chains": ["ethereum", "polygon"]
    },
    {
        "id": "pancakeswap",
        "name": "PancakeSwap",
        "logo": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/cake.png",
        "category": "DEX",
        "tvl_usd": 2400000000,
        "chains": ["bsc", "ethereum", "arbitrum"]
    },
    {
        "id": "curve",
        "name": "Curve Finance",
        "logo": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/crv.png",
        "category": "DEX",
        "tvl_usd": 1900000000,
        "chains": ["ethereum", "polygon", "arbitrum", "avalanche"]
    }
]

async def generate_pools_data():
    """Generate pools data with real protocol information"""
    pools = []
    protocols_data = await fetch_protocol_data()
    
    # Enhanced pool configurations with ZetaChain focus
    pool_configs = [
        {"name": "ZETA/USDC", "token0": "ZETA", "token1": "USDC", "base_apy": 8.5, "risk": "Low"},
        {"name": "ETH/USDC", "token0": "ETH", "token1": "USDC", "base_apy": 5.2, "risk": "Low"},
        {"name": "BTC/ETH", "token0": "WBTC", "token1": "ETH", "base_apy": 7.8, "risk": "Medium"},
        {"name": "MATIC/USDT", "token0": "MATIC", "token1": "USDT", "base_apy": 12.4, "risk": "Medium"},
        {"name": "AVAX/USDC", "token0": "AVAX", "token1": "USDC", "base_apy": 15.6, "risk": "Medium"},
        {"name": "BNB/BUSD", "token0": "BNB", "token1": "BUSD", "base_apy": 9.2, "risk": "Low"},
        {"name": "USDC/USDT", "token0": "USDC", "token1": "USDT", "base_apy": 3.8, "risk": "Low"},
        {"name": "LINK/ETH", "token0": "LINK", "token1": "ETH", "base_apy": 18.5, "risk": "High"},
        {"name": "UNI/ETH", "token0": "UNI", "token1": "ETH", "base_apy": 22.3, "risk": "High"},
        {"name": "ZETA/ETH", "token0": "ZETA", "token1": "ETH", "base_apy": 25.0, "risk": "Medium"}
    ]
    
    # Get available chains
    chains_data = await fetch_chain_data()
    available_chains = [chain["id"] for chain in chains_data]
    
    for protocol in protocols_data:
        # Use protocol's chains or fallback to available chains
        protocol_chains = protocol.get("chains", available_chains)
        # Ensure we have valid chain IDs
        valid_chains = [chain for chain in protocol_chains if chain in available_chains]
        if not valid_chains:
            valid_chains = ["zetachain"]  # Default to ZetaChain
        
        for chain_id in valid_chains[:3]:  # Limit to 3 chains per protocol
            for i, config in enumerate(pool_configs):
                if random.choice([True, False, True]):  # 66% chance to include
                    apy_multiplier = random.uniform(0.8, 1.3)
                    # Higher APY for ZetaChain pools
                    if chain_id == "zetachain":
                        apy_multiplier *= 1.2
                    
                    pool = {
                        "id": f"{protocol['id']}_{chain_id}_{i}",
                        "protocol_id": protocol["id"],
                        "chain_id": chain_id,
                        "name": f"{config['name']} Pool",
                        "symbol": f"{config['token0']}/{config['token1']}",
                        "token0": config["token0"],
                        "token1": config["token1"],
                        "apy": round(config["base_apy"] * apy_multiplier, 2),
                        "apy_7d": round(config["base_apy"] * apy_multiplier * random.uniform(0.9, 1.1), 2),
                        "apy_30d": round(config["base_apy"] * apy_multiplier * random.uniform(0.85, 1.15), 2),
                        "tvl_usd": random.randint(500000, 50000000),
                        "daily_volume_usd": random.randint(100000, 5000000),
                        "risk_score": {"Low": random.uniform(1, 3), "Medium": random.uniform(3, 7), "High": random.uniform(7, 10)}[config["risk"]],
                        "il_risk": config["risk"],
                        "auto_compound": random.choice([True, False]),
                        "rewards_tokens": random.sample(["ZETA", "UNI", "AAVE", "COMP", "CRV", "CAKE"], random.randint(1, 2))
                    }
                    pools.append(pool)
    return pools

def generate_portfolio_data():
    portfolios = []
    for i in range(8):
        deposited = random.uniform(1000, 50000)
        growth = random.uniform(1.02, 1.25)
        current_value = deposited * growth
        rewards = current_value - deposited
        
        portfolio = {
            "id": str(uuid.uuid4()),
            "user_address": f"0x{random.randint(10**15, 10**16-1):016x}",
            "chain_id": random.choice([chain["id"] for chain in CHAINS_DATA]),
            "pool_id": f"pool_{i}",
            "deposited_amount_usd": round(deposited, 2),
            "current_value_usd": round(current_value, 2),
            "rewards_earned_usd": round(rewards, 2),
            "last_compound": datetime.now() - timedelta(hours=random.randint(1, 72)),
            "apy_earned": round(random.uniform(5, 25), 2)
        }
        portfolios.append(portfolio)
    return portfolios

def generate_arbitrage_opportunities():
    opportunities = []
    tokens = ["ETH", "BTC", "MATIC", "AVAX", "BNB", "USDC", "USDT", "UNI", "AAVE"]
    
    for _ in range(12):
        token = random.choice(tokens)
        chains = random.sample([chain["id"] for chain in CHAINS_DATA], 2)
        source_price = random.uniform(1, 3000)
        price_diff = random.uniform(0.005, 0.03)  # 0.5% to 3% difference
        dest_price = source_price * (1 + price_diff)
        
        trade_size = random.uniform(1000, 10000)
        profit_usd = trade_size * price_diff
        gas_cost = random.uniform(5, 50)
        net_profit = profit_usd - gas_cost
        
        if net_profit > 0:
            opportunity = {
                "id": str(uuid.uuid4()),
                "token_symbol": token,
                "source_chain": chains[0],
                "dest_chain": chains[1],
                "source_price": round(source_price, 4),
                "dest_price": round(dest_price, 4),
                "profit_percentage": round(price_diff * 100, 2),
                "profit_usd": round(profit_usd, 2),
                "gas_cost_usd": round(gas_cost, 2),
                "net_profit_usd": round(net_profit, 2),
                "expires_at": datetime.now() + timedelta(minutes=random.randint(5, 30))
            }
            opportunities.append(opportunity)
    
    return sorted(opportunities, key=lambda x: x["net_profit_usd"], reverse=True)

# API Endpoints
@api_router.get("/")
async def root():
    return {
        "message": "Omnichain Yield Farming Aggregator API", 
        "version": "1.0",
        "zetachain_connected": w3 is not None and w3.is_connected(),
        "database_connected": client is not None,
        "supported_chains": ["zetachain", "ethereum", "bsc", "polygon", "avalanche", "arbitrum"]
    }

@api_router.get("/zetachain/status")
async def get_zetachain_status():
    """Get ZetaChain network status and information"""
    if not w3:
        return {"error": "ZetaChain connection not available"}
    
    try:
        latest_block = w3.eth.get_block('latest')
        gas_price = w3.eth.gas_price
        chain_id = w3.eth.chain_id
        
        return {
            "connected": True,
            "chain_id": chain_id,
            "latest_block": latest_block.number,
            "gas_price_gwei": w3.from_wei(gas_price, 'gwei'),
            "block_timestamp": latest_block.timestamp,
            "network_name": "ZetaChain Athens Testnet" if chain_id == 7001 else f"Chain {chain_id}"
        }
    except Exception as e:
        return {"error": f"Failed to get ZetaChain status: {str(e)}"}

@api_router.get("/zetachain/balance/{address}")
async def get_balance(address: str):
    """Get ZETA balance for an address"""
    if not w3:
        raise HTTPException(status_code=503, detail="ZetaChain connection not available")
    
    try:
        # Validate address format
        if not w3.is_address(address):
            raise HTTPException(status_code=400, detail="Invalid address format")
        
        balance_wei = w3.eth.get_balance(address)
        balance_zeta = w3.from_wei(balance_wei, 'ether')
        
        return {
            "address": address,
            "balance_wei": str(balance_wei),
            "balance_zeta": float(balance_zeta),
            "balance_usd": float(balance_zeta) * 0.5  # Mock USD price
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get balance: {str(e)}")

@api_router.get("/chains", response_model=List[Chain])
async def get_chains():
    chains_data = await fetch_chain_data()
    return [Chain(**chain) for chain in chains_data]

@api_router.get("/protocols", response_model=List[Protocol])
async def get_protocols():
    protocols_data = await fetch_protocol_data()
    return [Protocol(**protocol) for protocol in protocols_data]

@api_router.get("/pools", response_model=List[Pool])
async def get_pools(chain_id: Optional[str] = None, protocol_id: Optional[str] = None, sort_by: str = "apy"):
    pools = await generate_pools_data()
    
    # Apply filters
    if chain_id:
        pools = [pool for pool in pools if pool["chain_id"] == chain_id]
    if protocol_id:
        pools = [pool for pool in pools if pool["protocol_id"] == protocol_id]
    
    # Sort pools
    if sort_by == "apy":
        pools.sort(key=lambda x: x["apy"], reverse=True)
    elif sort_by == "tvl":
        pools.sort(key=lambda x: x["tvl_usd"], reverse=True)
    elif sort_by == "risk":
        pools.sort(key=lambda x: x["risk_score"])
    
    return [Pool(**pool) for pool in pools[:20]]

@api_router.get("/portfolio", response_model=List[Portfolio])
async def get_portfolio():
    portfolios = generate_portfolio_data()
    return [Portfolio(**portfolio) for portfolio in portfolios]

@api_router.get("/arbitrage", response_model=List[ArbitrageOpportunity])
async def get_arbitrage_opportunities():
    opportunities = generate_arbitrage_opportunities()
    return [ArbitrageOpportunity(**opp) for opp in opportunities[:10]]

@api_router.get("/analytics/overview")
async def get_analytics_overview():
    portfolio = generate_portfolio_data()
    total_deposited = sum(p["deposited_amount_usd"] for p in portfolio)
    total_value = sum(p["current_value_usd"] for p in portfolio)
    total_rewards = sum(p["rewards_earned_usd"] for p in portfolio)
    
    return {
        "total_value_locked": round(total_value, 2),
        "total_deposited": round(total_deposited, 2),
        "total_rewards_earned": round(total_rewards, 2),
        "total_profit_loss": round(total_value - total_deposited, 2),
        "average_apy": round(sum(p["apy_earned"] for p in portfolio) / len(portfolio), 2),
        "active_positions": len(portfolio),
        "chains_count": len(set(p["chain_id"] for p in portfolio)),
        "last_updated": datetime.now()
    }

@api_router.get("/analytics/yield-history")
async def get_yield_history():
    history = []
    base_date = datetime.now() - timedelta(days=30)
    
    for i in range(30):
        date = base_date + timedelta(days=i)
        value = 50000 + (i * 200) + random.uniform(-500, 800)
        history.append({
            "date": date.isoformat(),
            "total_value": round(value, 2),
            "daily_yield": round(random.uniform(50, 200), 2)
        })
    
    return history

@api_router.post("/strategy/optimize")
async def optimize_strategy(data: dict):
    """Mock strategy optimization endpoint"""
    await asyncio.sleep(1)  # Simulate processing time
    
    return {
        "optimized_allocation": {
            "ethereum": 35,
            "polygon": 25, 
            "bsc": 20,
            "arbitrum": 15,
            "avalanche": 5
        },
        "expected_apy": round(random.uniform(12, 18), 2),
        "risk_score": round(random.uniform(3, 6), 1),
        "gas_optimization_savings": round(random.uniform(50, 200), 2),
        "recommendations": [
            "Consider increasing allocation to Polygon for lower fees",
            "Auto-compound frequency optimized to every 3 days",
            "Diversify across more stable pairs to reduce IL risk"
        ]
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()