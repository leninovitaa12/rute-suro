"""
Rute-Suro Backend
FastAPI-based routing optimization system for Grebeg Suro event navigation
"""

import os
import json
import math
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import networkx as nx
from supabase import create_client, Client

from navigation_engine import (
    AStarRouter,
    load_graph_from_json,
    haversine_m,
    snap_to_nearest_node,
)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(title="Rute-Suro Backend", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== Configuration ==========
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
MAP_DATA_PATH = os.getenv("MAP_DATA_PATH", "./data/map_data.json")

if not all([SUPABASE_URL, SUPABASE_KEY]):
    logger.error("Missing Supabase configuration")
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize navigation graph and router
try:
    graph = load_graph_from_json(MAP_DATA_PATH)
    router = AStarRouter(graph)
    logger.info(f"Graph loaded: {graph.number_of_nodes()} nodes, {graph.number_of_edges()} edges")
except Exception as e:
    logger.error(f"Failed to load graph: {e}")
    raise

# ========== Pydantic Models ==========

class LocationInput(BaseModel):
    lat: float
    lng: float

class RouteRequest(BaseModel):
    start: LocationInput
    end: LocationInput
    mode: Optional[str] = "fastest"  # fastest, shortest, or both

class NearestNodeRequest(BaseModel):
    lat: float
    lng: float

class AdminDeriveEdgesRequest(BaseModel):
    a: LocationInput
    b: LocationInput

class Event(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: str
    end_time: str
    location_lat: float
    location_lng: float
    radius_m: Optional[float] = 1000

class RoadClosure(BaseModel):
    event_id: Optional[str] = None
    reason: Optional[str] = None
    start_time: str
    end_time: str
    edges: List[Dict[str, int]]  # [{"u": node_id, "v": node_id}, ...]

class CongestionZone(BaseModel):
    level: str  # MODERATE, HEAVY
    reason: Optional[str] = None
    start_time: str
    end_time: str
    edges: List[Dict[str, Any]]  # [{"u": ..., "v": ..., "lat": ..., "lng": ...}, ...]

# ========== Helpers ==========

def _parse_dt(s: Optional[str]) -> Optional[datetime]:
    """Parse ISO datetime string"""
    if not s:
        return None
    try:
        if isinstance(s, str):
            s = s.replace("Z", "+00:00")
        return datetime.fromisoformat(s)
    except Exception:
        return None

def _is_active(row: Dict, now: datetime) -> bool:
    """Check if event/closure is currently active"""
    st = _parse_dt(row.get("start_time"))
    en = _parse_dt(row.get("end_time"))
    if st and now < st:
        return False
    if en and now > en:
        return False
    return True

def _now_utc() -> datetime:
    """Get current UTC time"""
    return datetime.now(timezone.utc)

def _iso(dt: datetime) -> str:
    """Convert datetime to ISO string"""
    return dt.astimezone(timezone.utc).isoformat()

# ========== Health Check ==========

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": "rute-suro-backend"}

# ========== Navigation Endpoints ==========

@app.post("/route")
async def calculate_route(request: RouteRequest):
    """
    Calculate optimal route using A* algorithm
    
    Query params:
    - mode: "fastest" (default), "shortest", or "both"
    """
    try:
        start_lat, start_lng = float(request.start.lat), float(request.start.lng)
        end_lat, end_lng = float(request.end.lat), float(request.end.lng)
        mode = (request.mode or "fastest").strip().lower()

        # Fetch active road closures
        now = _now_utc()
        closures_response = await supabase.table("road_closures").select("*").execute()
        closures = [c for c in (closures_response.data or []) if _is_active(c, now)]

        # Build closed edges list
        closed_edges = []
        for closure in closures:
            closed_edges.extend(closure.get("edges", []))

        # Fetch active congestion zones
        congestion_response = await supabase.table("congestion_zones").select("*").execute()
        congestion_zones = [c for c in (congestion_response.data or []) if _is_active(c, now)]

        # Calculate route
        if mode == "both":
            result = router.astar_route_both(
                start_lat, start_lng,
                end_lat, end_lng,
                closed_edges=closed_edges,
                congestion_zones=congestion_zones
            )
        else:
            result = router.astar_route(
                start_lat, start_lng,
                end_lat, end_lng,
                closed_edges=closed_edges,
                mode=mode,
                congestion_zones=congestion_zones
            )

        # Add active closures/congestion info to response
        result["closures_active"] = [
            {
                "id": c.get("id"),
                "reason": c.get("reason"),
                "event_id": c.get("event_id")
            }
            for c in closures
        ]
        result["congestion_active"] = [
            {
                "id": c.get("id"),
                "level": c.get("level"),
                "reason": c.get("reason"),
                "event_id": c.get("event_id")
            }
            for c in congestion_zones
        ]

        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Route calculation error: {e}")
        raise HTTPException(status_code=500, detail="Route calculation failed")

@app.get("/nearest-node")
async def get_nearest_node(lat: float = Query(...), lng: float = Query(...)):
    """
    Find nearest node in graph to given coordinates (snap to road)
    """
    try:
        node_id, distance = snap_to_nearest_node(graph, lat, lng)
        return {
            "node_id": node_id,
            "distance_m": distance,
            "lat": float(graph.nodes[node_id]["y"]),
            "lng": float(graph.nodes[node_id]["x"])
        }
    except Exception as e:
        logger.error(f"Nearest node error: {e}")
        raise HTTPException(status_code=500, detail="Failed to find nearest node")

@app.get("/map-bootstrap")
async def map_bootstrap():
    """
    Bootstrap data for map initialization
    Returns: events, active closures, active congestion zones, parking spots
    """
    try:
        now = _now_utc()

        # Fetch all data in parallel
        events_response = await supabase.table("events").select("*").order("start_time", desc=False).execute()
        events = events_response.data or []

        closures_response = await supabase.table("road_closures").select("*").execute()
        active_closures = [c for c in (closures_response.data or []) if _is_active(c, now)]

        congestion_response = await supabase.table("congestion_zones").select("*").execute()
        active_congestion = [c for c in (congestion_response.data or []) if _is_active(c, now)]

        parking_response = await supabase.table("parking_spots").select("*").execute()
        parking_spots = parking_response.data or []

        return {
            "server_time": _iso(now),
            "ttl_seconds": 30,
            "events": events,
            "closures_active": active_closures,
            "congestion_active": active_congestion,
            "parking_spots": parking_spots
        }
    except Exception as e:
        logger.error(f"Bootstrap error: {e}")
        raise HTTPException(status_code=500, detail="Bootstrap failed")

# ========== Events Management ==========

@app.get("/events")
async def list_events(active: bool = Query(False)):
    """List all events, optionally filtered to active ones"""
    try:
        response = await supabase.table("events").select("*").order("start_time", desc=False).execute()
        events = response.data or []
        
        if active:
            now = _now_utc()
            events = [e for e in events if _is_active(e, now)]
        
        return events
    except Exception as e:
        logger.error(f"List events error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch events")

@app.post("/events")
async def create_event(event: Event):
    """Create new event"""
    try:
        data = {
            "title": event.title,
            "description": event.description,
            "start_time": event.start_time,
            "end_time": event.end_time,
            "location_lat": event.location_lat,
            "location_lng": event.location_lng,
            "radius_m": event.radius_m,
            "created_at": _iso(_now_utc())
        }
        response = await supabase.table("events").insert([data]).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create event")
        return response.data[0]
    except Exception as e:
        logger.error(f"Create event error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create event")

@app.put("/events/{event_id}")
async def update_event(event_id: str, event: Event):
    """Update existing event"""
    try:
        data = {
            "title": event.title,
            "description": event.description,
            "start_time": event.start_time,
            "end_time": event.end_time,
            "location_lat": event.location_lat,
            "location_lng": event.location_lng,
            "radius_m": event.radius_m
        }
        response = await supabase.table("events").update(data).eq("id", event_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Event not found")
        return response.data[0]
    except Exception as e:
        logger.error(f"Update event error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update event")

@app.delete("/events/{event_id}")
async def delete_event(event_id: str):
    """Delete event"""
    try:
        await supabase.table("events").delete().eq("id", event_id).execute()
        return {"success": True}
    except Exception as e:
        logger.error(f"Delete event error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete event")

# ========== Road Closures (Admin) ==========

@app.get("/road-closures")
async def list_closures(active: bool = Query(False)):
    """List all road closures"""
    try:
        response = await supabase.table("road_closures").select("*").order("created_at", desc=True).execute()
        closures = response.data or []
        
        if active:
            now = _now_utc()
            closures = [c for c in closures if _is_active(c, now)]
        
        return closures
    except Exception as e:
        logger.error(f"List closures error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch closures")

@app.post("/road-closures")
async def create_closure(closure: RoadClosure):
    """Create new road closure (admin only)"""
    try:
        data = {
            "event_id": closure.event_id,
            "reason": closure.reason,
            "start_time": closure.start_time,
            "end_time": closure.end_time,
            "edges": closure.edges,
            "created_at": _iso(_now_utc())
        }
        response = await supabase.table("road_closures").insert([data]).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create closure")
        return response.data[0]
    except Exception as e:
        logger.error(f"Create closure error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create closure")

@app.put("/road-closures/{closure_id}")
async def update_closure(closure_id: str, closure: RoadClosure):
    """Update road closure"""
    try:
        data = {
            "reason": closure.reason,
            "start_time": closure.start_time,
            "end_time": closure.end_time,
            "edges": closure.edges
        }
        response = await supabase.table("road_closures").update(data).eq("id", closure_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Closure not found")
        return response.data[0]
    except Exception as e:
        logger.error(f"Update closure error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update closure")

@app.delete("/road-closures/{closure_id}")
async def delete_closure(closure_id: str):
    """Delete road closure"""
    try:
        await supabase.table("road_closures").delete().eq("id", closure_id).execute()
        return {"success": True}
    except Exception as e:
        logger.error(f"Delete closure error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete closure")

# ========== Congestion Zones (Dynamic Traffic) ==========

@app.get("/congestion-zones")
async def list_congestion(active: bool = Query(False)):
    """List all congestion zones"""
    try:
        response = await supabase.table("congestion_zones").select("*").order("created_at", desc=True).execute()
        zones = response.data or []
        
        if active:
            now = _now_utc()
            zones = [z for z in zones if _is_active(z, now)]
        
        return zones
    except Exception as e:
        logger.error(f"List congestion error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch congestion zones")

@app.post("/congestion-zones")
async def create_congestion(zone: CongestionZone):
    """Create new congestion zone (admin or traffic sync)"""
    try:
        data = {
            "level": zone.level,
            "reason": zone.reason,
            "start_time": zone.start_time,
            "end_time": zone.end_time,
            "edges": zone.edges,
            "created_at": _iso(_now_utc())
        }
        response = await supabase.table("congestion_zones").insert([data]).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create zone")
        return response.data[0]
    except Exception as e:
        logger.error(f"Create congestion error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create congestion zone")

@app.put("/congestion-zones/{zone_id}")
async def update_congestion(zone_id: str, zone: CongestionZone):
    """Update congestion zone"""
    try:
        data = {
            "level": zone.level,
            "reason": zone.reason,
            "start_time": zone.start_time,
            "end_time": zone.end_time,
            "edges": zone.edges
        }
        response = await supabase.table("congestion_zones").update(data).eq("id", zone_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Zone not found")
        return response.data[0]
    except Exception as e:
        logger.error(f"Update congestion error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update congestion zone")

@app.delete("/congestion-zones/{zone_id}")
async def delete_congestion(zone_id: str):
    """Delete congestion zone"""
    try:
        await supabase.table("congestion_zones").delete().eq("id", zone_id).execute()
        return {"success": True}
    except Exception as e:
        logger.error(f"Delete congestion error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete congestion zone")

# ========== Parking Spots ==========

@app.get("/parking-spots")
async def list_parking():
    """List all parking spots"""
    try:
        response = await supabase.table("parking_spots").select("*").order("created_at", desc=False).execute()
        return response.data or []
    except Exception as e:
        logger.error(f"List parking error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch parking spots")

@app.post("/parking-spots")
async def create_parking(name: str, lat: float, lng: float, event_id: Optional[str] = None):
    """Create new parking spot"""
    try:
        data = {
            "name": name,
            "lat": lat,
            "lng": lng,
            "event_id": event_id,
            "created_at": _iso(_now_utc())
        }
        response = await supabase.table("parking_spots").insert([data]).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create parking spot")
        return response.data[0]
    except Exception as e:
        logger.error(f"Create parking error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create parking spot")

@app.delete("/parking-spots/{spot_id}")
async def delete_parking(spot_id: str):
    """Delete parking spot"""
    try:
        await supabase.table("parking_spots").delete().eq("id", spot_id).execute()
        return {"success": True}
    except Exception as e:
        logger.error(f"Delete parking error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete parking spot")

# ========== Admin: Derive Edges ==========

@app.post("/admin/derive-edges")
async def admin_derive_edges(request: AdminDeriveEdgesRequest):
    """
    Admin helper: find edges between two map points
    Used for creating road closures
    """
    try:
        a_lat, a_lng = float(request.a.lat), float(request.a.lng)
        b_lat, b_lng = float(request.b.lat), float(request.b.lng)

        # Snap both points to nearest nodes
        node_a, _ = snap_to_nearest_node(graph, a_lat, a_lng)
        node_b, _ = snap_to_nearest_node(graph, b_lat, b_lng)

        # Find shortest path
        try:
            path = nx.shortest_path(graph, node_a, node_b, weight="length")
        except nx.NetworkXNoPath:
            raise HTTPException(status_code=400, detail="No path between points")

        # Build edges list
        edges = []
        for u, v in zip(path[:-1], path[1:]):
            edges.append({"u": int(u), "v": int(v)})

        return {
            "start_node": node_a,
            "end_node": node_b,
            "edges": edges,
            "num_edges": len(edges)
        }
    except Exception as e:
        logger.error(f"Derive edges error: {e}")
        raise HTTPException(status_code=500, detail="Failed to derive edges")

# ========== Startup ==========

@app.on_event("startup")
async def startup():
    logger.info("Rute-Suro Backend started")
    logger.info(f"Graph: {graph.number_of_nodes()} nodes, {graph.number_of_edges()} edges")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
