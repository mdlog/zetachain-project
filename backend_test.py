import requests
import sys
from datetime import datetime
import json

class OmnichainAPITester:
    def __init__(self, base_url="https://omni-connect-5.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, check_fields=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            response_data = {}
            
            if success:
                try:
                    response_data = response.json()
                    
                    # Check required fields if specified
                    if check_fields and isinstance(response_data, dict):
                        for field in check_fields:
                            if field not in response_data:
                                success = False
                                print(f"❌ Missing required field: {field}")
                                break
                    elif check_fields and isinstance(response_data, list) and len(response_data) > 0:
                        for field in check_fields:
                            if field not in response_data[0]:
                                success = False
                                print(f"❌ Missing required field in array item: {field}")
                                break
                                
                except json.JSONDecodeError:
                    print(f"❌ Invalid JSON response")
                    success = False

            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if isinstance(response_data, list):
                    print(f"   Response: Array with {len(response_data)} items")
                elif isinstance(response_data, dict):
                    print(f"   Response: Object with {len(response_data)} fields")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                if response.text:
                    print(f"   Error: {response.text[:200]}")

            self.test_results.append({
                "name": name,
                "endpoint": endpoint,
                "method": method,
                "status_code": response.status_code,
                "expected_status": expected_status,
                "success": success,
                "response_size": len(response_data) if isinstance(response_data, list) else len(str(response_data))
            })

            return success, response_data

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - Network Error: {str(e)}")
            self.test_results.append({
                "name": name,
                "endpoint": endpoint,
                "method": method,
                "status_code": 0,
                "expected_status": expected_status,
                "success": False,
                "error": str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200,
            check_fields=["message", "version"]
        )

    def test_chains_endpoint(self):
        """Test chains endpoint"""
        return self.run_test(
            "Chains Endpoint",
            "GET", 
            "chains",
            200,
            check_fields=["id", "name", "symbol", "logo"]
        )

    def test_protocols_endpoint(self):
        """Test protocols endpoint"""
        return self.run_test(
            "Protocols Endpoint",
            "GET",
            "protocols", 
            200,
            check_fields=["id", "name", "category", "tvl_usd"]
        )

    def test_pools_endpoint(self):
        """Test pools endpoint"""
        success, data = self.run_test(
            "Pools Endpoint",
            "GET",
            "pools",
            200,
            check_fields=["id", "protocol_id", "chain_id", "apy", "tvl_usd"]
        )
        
        if success and data:
            print(f"   Found {len(data)} pools")
            if len(data) > 0:
                print(f"   Sample pool APY: {data[0].get('apy', 'N/A')}%")
        
        return success, data

    def test_pools_with_filters(self):
        """Test pools endpoint with chain filter"""
        return self.run_test(
            "Pools with Chain Filter",
            "GET",
            "pools?chain_id=ethereum",
            200,
            check_fields=["id", "chain_id"]
        )

    def test_portfolio_endpoint(self):
        """Test portfolio endpoint"""
        success, data = self.run_test(
            "Portfolio Endpoint",
            "GET",
            "portfolio",
            200,
            check_fields=["id", "chain_id", "deposited_amount_usd", "current_value_usd"]
        )
        
        if success and data:
            print(f"   Found {len(data)} portfolio positions")
            total_value = sum(pos.get('current_value_usd', 0) for pos in data)
            print(f"   Total portfolio value: ${total_value:,.2f}")
        
        return success, data

    def test_arbitrage_endpoint(self):
        """Test arbitrage opportunities endpoint"""
        success, data = self.run_test(
            "Arbitrage Opportunities",
            "GET",
            "arbitrage",
            200,
            check_fields=["id", "token_symbol", "source_chain", "dest_chain", "profit_usd"]
        )
        
        if success and data:
            print(f"   Found {len(data)} arbitrage opportunities")
            if len(data) > 0:
                best_profit = max(opp.get('net_profit_usd', 0) for opp in data)
                print(f"   Best opportunity profit: ${best_profit}")
        
        return success, data

    def test_analytics_overview(self):
        """Test analytics overview endpoint"""
        success, data = self.run_test(
            "Analytics Overview",
            "GET",
            "analytics/overview",
            200,
            check_fields=["total_value_locked", "total_rewards_earned", "average_apy", "active_positions"]
        )
        
        if success and data:
            print(f"   TVL: ${data.get('total_value_locked', 0):,.2f}")
            print(f"   Avg APY: {data.get('average_apy', 0)}%")
            print(f"   Active positions: {data.get('active_positions', 0)}")
        
        return success, data

    def test_yield_history(self):
        """Test yield history endpoint"""
        return self.run_test(
            "Yield History",
            "GET",
            "analytics/yield-history",
            200,
            check_fields=["date", "total_value", "daily_yield"]
        )

    def test_strategy_optimization(self):
        """Test strategy optimization endpoint"""
        test_data = {
            "risk_tolerance": "medium",
            "investment_amount": 10000,
            "preferred_chains": ["ethereum", "polygon"]
        }
        
        success, data = self.run_test(
            "Strategy Optimization",
            "POST",
            "strategy/optimize",
            200,
            data=test_data,
            check_fields=["optimized_allocation", "expected_apy", "recommendations"]
        )
        
        if success and data:
            print(f"   Expected APY: {data.get('expected_apy', 0)}%")
            print(f"   Risk Score: {data.get('risk_score', 0)}")
            recommendations = data.get('recommendations', [])
            print(f"   Recommendations: {len(recommendations)} items")
        
        return success, data

def main():
    print("🚀 Starting Omnichain Yield Farming Aggregator API Tests")
    print("=" * 60)
    
    tester = OmnichainAPITester()
    
    # Run all tests
    test_methods = [
        tester.test_root_endpoint,
        tester.test_chains_endpoint,
        tester.test_protocols_endpoint,
        tester.test_pools_endpoint,
        tester.test_pools_with_filters,
        tester.test_portfolio_endpoint,
        tester.test_arbitrage_endpoint,
        tester.test_analytics_overview,
        tester.test_yield_history,
        tester.test_strategy_optimization
    ]
    
    for test_method in test_methods:
        try:
            test_method()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
    
    # Print summary
    print("\n" + "=" * 60)
    print(f"📊 Test Summary:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    # Print failed tests
    failed_tests = [test for test in tester.test_results if not test['success']]
    if failed_tests:
        print(f"\n❌ Failed Tests ({len(failed_tests)}):")
        for test in failed_tests:
            error_msg = test.get('error', f'Status {test["status_code"]}')
            print(f"   - {test['name']}: {error_msg}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())