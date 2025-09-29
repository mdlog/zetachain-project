#!/usr/bin/env python3

import asyncio
import aiohttp

async def test_apis():
    async with aiohttp.ClientSession() as session:
        # Test DeFiLlama API
        try:
            async with session.get('https://api.llama.fi/protocols') as response:
                if response.status == 200:
                    data = await response.json()
                    print(f'✅ DeFiLlama API: {len(data)} protocols available')
                else:
                    print('❌ DeFiLlama API failed')
        except Exception as e:
            print(f'❌ DeFiLlama API error: {e}')
        
        # Test CoinGecko API
        try:
            async with session.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin&vs_currencies=usd') as response:
                if response.status == 200:
                    data = await response.json()
                    print(f'✅ CoinGecko API: ETH=${data["ethereum"]["usd"]}, BTC=${data["bitcoin"]["usd"]}')
                else:
                    print('❌ CoinGecko API failed')
        except Exception as e:
            print(f'❌ CoinGecko API error: {e}')

if __name__ == "__main__":
    asyncio.run(test_apis())
