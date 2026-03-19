"""
Simple test script to validate Rute-Suro API endpoints
Run: python test_api.py
"""

import requests
import json
from datetime import datetime, timedelta, timezone

# Configuration
BASE_URL = "http://localhost:8000"
HEADERS = {"Content-Type": "application/json"}

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_test(name):
    print(f"\n{BLUE}▶ Testing: {name}{RESET}")

def print_success(message):
    print(f"{GREEN}✓ {message}{RESET}")

def print_error(message):
    print(f"{RED}✗ {message}{RESET}")

def test_health():
    """Test health check endpoint"""
    print_test("Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print_success(f"Health check passed: {data}")
        return True
    except Exception as e:
        print_error(f"Health check failed: {e}")
        return False

def test_nearest_node():
    """Test nearest node endpoint"""
    print_test("Nearest Node (Snap to Road)")
    try:
        params = {"lat": -7.8728, "lng": 111.4625}
        response = requests.get(f"{BASE_URL}/nearest-node", params=params, timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "node_id" in data
        assert "distance_m" in data
        print_success(f"Found nearest node: ID={data['node_id']}, Distance={data['distance_m']:.1f}m")
        return True
    except Exception as e:
        print_error(f"Nearest node failed: {e}")
        return False

def test_route_fastest():
    """Test route calculation - fastest mode"""
    print_test("Route Calculation (Fastest Mode)")
    try:
        payload = {
            "start": {"lat": -7.8728, "lng": 111.4625},
            "end": {"lat": -7.8752, "lng": 111.4625},
            "mode": "fastest"
        }
        response = requests.post(
            f"{BASE_URL}/route",
            json=payload,
            headers=HEADERS,
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        assert "polyline" in data
        assert "total_time_sec" in data
        assert "total_length_m" in data
        assert "steps" in data
        print_success(
            f"Route calculated - Time: {data['total_time_sec']:.1f}s, "
            f"Distance: {data['total_length_m']:.1f}m, "
            f"Steps: {len(data['steps'])}"
        )
        return True
    except Exception as e:
        print_error(f"Route calculation failed: {e}")
        return False

def test_route_shortest():
    """Test route calculation - shortest mode"""
    print_test("Route Calculation (Shortest Mode)")
    try:
        payload = {
            "start": {"lat": -7.8728, "lng": 111.4625},
            "end": {"lat": -7.8752, "lng": 111.4625},
            "mode": "shortest"
        }
        response = requests.post(
            f"{BASE_URL}/route",
            json=payload,
            headers=HEADERS,
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        assert data["mode"] == "shortest"
        print_success(f"Shortest route calculated - Distance: {data['total_length_m']:.1f}m")
        return True
    except Exception as e:
        print_error(f"Shortest route calculation failed: {e}")
        return False

def test_route_both():
    """Test route calculation - both modes"""
    print_test("Route Calculation (Both Modes)")
    try:
        payload = {
            "start": {"lat": -7.8728, "lng": 111.4625},
            "end": {"lat": -7.8752, "lng": 111.4625},
            "mode": "both"
        }
        response = requests.post(
            f"{BASE_URL}/route",
            json=payload,
            headers=HEADERS,
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        assert "fastest" in data
        assert "shortest" in data
        print_success(
            f"Both routes calculated - "
            f"Fastest: {data['fastest']['total_time_sec']:.1f}s, "
            f"Shortest: {data['shortest']['total_length_m']:.1f}m"
        )
        return True
    except Exception as e:
        print_error(f"Both routes calculation failed: {e}")
        return False

def test_map_bootstrap():
    """Test map bootstrap endpoint"""
    print_test("Map Bootstrap (All Data)")
    try:
        response = requests.get(f"{BASE_URL}/map-bootstrap", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "server_time" in data
        assert "events" in data
        assert "closures_active" in data
        assert "congestion_active" in data
        assert "parking_spots" in data
        print_success(
            f"Bootstrap data retrieved - "
            f"Events: {len(data['events'])}, "
            f"Closures: {len(data['closures_active'])}, "
            f"Parking: {len(data['parking_spots'])}"
        )
        return True
    except Exception as e:
        print_error(f"Map bootstrap failed: {e}")
        return False

def test_events_list():
    """Test events listing"""
    print_test("List Events")
    try:
        response = requests.get(f"{BASE_URL}/events", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print_success(f"Events retrieved: {len(data)} total")
        if len(data) > 0:
            print_success(f"Sample event: {data[0].get('title', 'Unknown')}")
        return True
    except Exception as e:
        print_error(f"Events listing failed: {e}")
        return False

def test_create_event():
    """Test event creation"""
    print_test("Create Event")
    try:
        now = datetime.now(timezone.utc)
        start = (now + timedelta(days=7)).isoformat()
        end = (now + timedelta(days=8)).isoformat()
        
        payload = {
            "title": f"Test Event {datetime.now().strftime('%H%M%S')}",
            "description": "Automated test event",
            "start_time": start,
            "end_time": end,
            "location_lat": -7.8728,
            "location_lng": 111.4625,
            "radius_m": 1000
        }
        
        response = requests.post(
            f"{BASE_URL}/events",
            json=payload,
            headers=HEADERS,
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        print_success(f"Event created: ID={data['id']}")
        return data["id"]  # Return for cleanup
    except Exception as e:
        print_error(f"Event creation failed: {e}")
        return None

def test_admin_derive_edges():
    """Test admin derive edges helper"""
    print_test("Admin Derive Edges")
    try:
        payload = {
            "a": {"lat": -7.8728, "lng": 111.4625},
            "b": {"lat": -7.8752, "lng": 111.4625}
        }
        response = requests.post(
            f"{BASE_URL}/admin/derive-edges",
            json=payload,
            headers=HEADERS,
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        assert "edges" in data
        assert "start_node" in data
        assert "end_node" in data
        print_success(
            f"Edges derived - "
            f"Start: {data['start_node']}, "
            f"End: {data['end_node']}, "
            f"Edges: {data['num_edges']}"
        )
        return data["edges"]  # Return for next test
    except Exception as e:
        print_error(f"Derive edges failed: {e}")
        return None

def test_create_closure(edges):
    """Test road closure creation"""
    print_test("Create Road Closure")
    if not edges:
        print_error("Skipping - no edges available")
        return None
    
    try:
        now = datetime.now(timezone.utc)
        start = now.isoformat()
        end = (now + timedelta(hours=2)).isoformat()
        
        payload = {
            "reason": f"Test closure {datetime.now().strftime('%H%M%S')}",
            "start_time": start,
            "end_time": end,
            "edges": edges[:3]  # Use first 3 edges
        }
        
        response = requests.post(
            f"{BASE_URL}/road-closures",
            json=payload,
            headers=HEADERS,
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        print_success(f"Closure created: ID={data['id']}")
        return data["id"]
    except Exception as e:
        print_error(f"Closure creation failed: {e}")
        return None

def test_parking_spots():
    """Test parking spots"""
    print_test("List Parking Spots")
    try:
        response = requests.get(f"{BASE_URL}/parking-spots", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print_success(f"Parking spots retrieved: {len(data)} total")
        return True
    except Exception as e:
        print_error(f"Parking spots failed: {e}")
        return False

def main():
    """Run all tests"""
    print(f"\n{BLUE}{'='*60}")
    print("Rute-Suro API Test Suite")
    print(f"{'='*60}{RESET}")
    print(f"Base URL: {BASE_URL}\n")
    
    results = []
    
    # Core functionality tests
    results.append(("Health Check", test_health()))
    results.append(("Nearest Node", test_nearest_node()))
    results.append(("Route (Fastest)", test_route_fastest()))
    results.append(("Route (Shortest)", test_route_shortest()))
    results.append(("Route (Both)", test_route_both()))
    results.append(("Map Bootstrap", test_map_bootstrap()))
    
    # CRUD tests
    results.append(("List Events", test_events_list()))
    event_id = test_create_event()
    
    # Admin tests
    edges = test_admin_derive_edges()
    closure_id = test_create_closure(edges)
    
    # Data tests
    results.append(("Parking Spots", test_parking_spots()))
    
    # Summary
    print(f"\n{BLUE}{'='*60}")
    print("Test Summary")
    print(f"{'='*60}{RESET}\n")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = f"{GREEN}PASS{RESET}" if result else f"{RED}FAIL{RESET}"
        print(f"{test_name}: {status}")
    
    print(f"\n{BLUE}Total: {passed}/{total} tests passed{RESET}\n")
    
    # Additional info
    if event_id:
        print(f"Created event ID: {event_id}")
    if closure_id:
        print(f"Created closure ID: {closure_id}")
    
    return passed == total

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
