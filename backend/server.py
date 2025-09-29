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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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

# Mock data
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

def generate_pools_data():
    pools = []
    pool_configs = [
        {"name": "ETH/USDC", "token0": "ETH", "token1": "USDC", "base_apy": 5.2, "risk": "Low"},
        {"name": "BTC/ETH", "token0": "WBTC", "token1": "ETH", "base_apy": 7.8, "risk": "Medium"},
        {"name": "MATIC/USDT", "token0": "MATIC", "token1": "USDT", "base_apy": 12.4, "risk": "Medium"},
        {"name": "AVAX/USDC", "token0": "AVAX", "token1": "USDC", "base_apy": 15.6, "risk": "Medium"},
        {"name": "BNB/BUSD", "token0": "BNB", "token1": "BUSD", "base_apy": 9.2, "risk": "Low"},
        {"name": "USDC/USDT", "token0": "USDC", "token1": "USDT", "base_apy": 3.8, "risk": "Low"},
        {"name": "LINK/ETH", "token0": "LINK", "token1": "ETH", "base_apy": 18.5, "risk": "High"},
        {"name": "UNI/ETH", "token0": "UNI", "token1": "ETH", "base_apy": 22.3, "risk": "High"}
    ]
    
    for protocol in PROTOCOLS_DATA:
        for chain_id in protocol["chains"]:
            for i, config in enumerate(pool_configs):
                if random.choice([True, False, True]):  # 66% chance to include
                    apy_multiplier = random.uniform(0.8, 1.3)
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
                        "rewards_tokens": random.sample(["UNI", "AAVE", "COMP", "CRV", "CAKE"], random.randint(1, 2))
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
    return {"message": "Omnichain Yield Farming Aggregator API", "version": "1.0"}

@api_router.get("/chains", response_model=List[Chain])
async def get_chains():
    return [Chain(**chain) for chain in CHAINS_DATA]

@api_router.get("/protocols", response_model=List[Protocol])
async def get_protocols():
    return [Protocol(**protocol) for protocol in PROTOCOLS_DATA]

@api_router.get("/pools", response_model=List[Pool])
async def get_pools(chain_id: Optional[str] = None, protocol_id: Optional[str] = None, sort_by: str = "apy"):
    pools = generate_pools_data()
    
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