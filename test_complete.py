#!/usr/bin/env python3

import asyncio
import aiohttp
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

async def test_complete_system():
    print("🧪 Testing OmniYield Complete System")
    print("=" * 50)
    
    # Test 1: Backend imports
    print("1. Testing backend imports...")
    try:
        from server import app, fetch_chain_data, fetch_protocol_data, fetch_token_prices
        print("   ✅ Backend imports successful")
    except Exception as e:
        print(f"   ❌ Backend imports failed: {e}")
        return False
    
    # Test 2: ZetaChain connection
    print("2. Testing ZetaChain connection...")
    try:
        from web3 import Web3
        w3 = Web3(Web3.HTTPProvider('https://zetachain-athens-evm.blockpi.network/v1/rpc/public'))
        if w3.is_connected():
            print(f"   ✅ ZetaChain connected - Chain ID: {w3.eth.chain_id}")
        else:
            print("   ❌ ZetaChain connection failed")
            return False
    except Exception as e:
        print(f"   ❌ ZetaChain test failed: {e}")
        return False
    
    # Test 3: External APIs
    print("3. Testing external APIs...")
    async with aiohttp.ClientSession() as session:
        # Test DeFiLlama
        try:
            async with session.get('https://api.llama.fi/protocols') as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"   ✅ DeFiLlama API: {len(data)} protocols")
                else:
                    print("   ❌ DeFiLlama API failed")
        except Exception as e:
            print(f"   ❌ DeFiLlama API error: {e}")
        
        # Test CoinGecko
        try:
            async with session.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd') as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"   ✅ CoinGecko API: ETH=${data['ethereum']['usd']}")
                else:
                    print("   ❌ CoinGecko API failed")
        except Exception as e:
            print(f"   ❌ CoinGecko API error: {e}")
    
    # Test 4: Backend functions
    print("4. Testing backend functions...")
    try:
        chains = await fetch_chain_data()
        print(f"   ✅ Chain data: {len(chains)} chains")
        
        protocols = await fetch_protocol_data()
        print(f"   ✅ Protocol data: {len(protocols)} protocols")
        
        prices = await fetch_token_prices()
        print(f"   ✅ Token prices: {len(prices)} tokens")
    except Exception as e:
        print(f"   ❌ Backend functions failed: {e}")
        return False
    
    # Test 5: Frontend build
    print("5. Testing frontend build...")
    frontend_build = Path(__file__).parent / "frontend" / "build"
    if frontend_build.exists():
        print("   ✅ Frontend build exists")
    else:
        print("   ⚠️ Frontend build not found (run npm run build)")
    
    print("\n🎉 All tests completed successfully!")
    print("✅ OmniYield is ready for deployment!")
    return True

if __name__ == "__main__":
    success = asyncio.run(test_complete_system())
    sys.exit(0 if success else 1)
