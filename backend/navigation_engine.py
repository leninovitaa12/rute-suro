"""
Navigation Engine - Manual A* Implementation with Haversine Distance
Implements heuristic search for optimal route calculation on road networks
"""

import json
import math
import os
import logging
from typing import Dict, List, Tuple, Optional, Any
import networkx as nx

logger = logging.getLogger(__name__)

# ========== Constants ==========

# Indonesia realistic speeds (km/h) - NOT Europestandard
INDONESIA_SPEEDS = {
    "motorway": 70,  # highway / toll
    "motorway_link": 50,
    "trunk": 50,  # national artery
    "trunk_link": 40,
    "primary": 35,  # often congested
    "primary_link": 25,
    "secondary": 28,  # provincial
    "secondary_link": 20,
    "tertiary": 22,  # city/district
    "tertiary_link": 15,
    "residential": 18,  # residential
    "unclassified": 18,
    "service": 12,  # alleys
    "living_street": 10,
    "track": 12,
    "road": 20,
}

# Congestion penalty multipliers (affect travel_time)
CONGESTION_PENALTY = {
    "MODERATE": 2.5,  # 2.5x slower
    "HEAVY": 5.0,  # 5x slower
}

# Configuration from env
MAX_SNAP_DISTANCE_M = float(os.getenv("MAX_SNAP_DISTANCE_M", "500"))
MAX_SPEED_KPH = float(os.getenv("MAX_SPEED_KPH", "70"))
TURN_THRESHOLD_DEG = float(os.getenv("TURN_THRESHOLD_DEG", "25"))
STRONG_TURN_THRESHOLD_DEG = float(os.getenv("STRONG_TURN_THRESHOLD_DEG", "60"))

# ========== Haversine Distance ==========

def haversine_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate distance between two points using Haversine formula
    Returns distance in meters
    """
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    
    a = (math.sin(dphi / 2) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(dlng / 2) ** 2)
    
    return 2 * R * math.asin(math.sqrt(a))

# ========== Graph Loading ==========

def load_graph_from_json(filepath: str) -> nx.MultiDiGraph:
    """
    Load road network graph from GeoJSON file
    
    Expected JSON format:
    {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "LineString", "coordinates": [[lng, lat], ...]},
                "properties": {
                    "name": "Jalan...",
                    "highway": "residential",
                    ...
                }
            }
        ]
    }
    """
    G = nx.MultiDiGraph()
    
    if not os.path.exists(filepath):
        logger.error(f"Map data file not found: {filepath}")
        # Return empty graph - will be populated later
        return G
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        node_id = 0
        node_coords = {}  # Map to avoid duplicates
        
        for feature in data.get("features", []):
            if feature.get("type") != "Feature":
                continue
            
            geom = feature.get("geometry", {})
            if geom.get("type") != "LineString":
                continue
            
            coords = geom.get("coordinates", [])
            if len(coords) < 2:
                continue
            
            props = feature.get("properties", {})
            highway_type = props.get("highway", "unclassified")
            road_name = props.get("name", "Unnamed Road")
            speed = INDONESIA_SPEEDS.get(highway_type, 20)
            
            # Add nodes and build edges
            nodes = []
            for lng, lat in coords:
                # Use lat,lng as unique key (rounded to avoid floating point issues)
                key = (round(lat, 7), round(lng, 7))
                
                if key not in node_coords:
                    node_coords[key] = node_id
                    G.add_node(node_id, y=lat, x=lng)
                    node_id += 1
                
                nodes.append(node_coords[key])
            
            # Add edges between consecutive nodes
            for i in range(len(nodes) - 1):
                u, v = nodes[i], nodes[i + 1]
                lat1 = G.nodes[u]["y"]
                lng1 = G.nodes[u]["x"]
                lat2 = G.nodes[v]["y"]
                lng2 = G.nodes[v]["x"]
                
                distance = haversine_m(lat1, lng1, lat2, lng2)
                travel_time = (distance / 1000.0) / speed * 3600  # seconds
                
                G.add_edge(u, v,
                    length=distance,
                    travel_time=travel_time,
                    speed=speed,
                    highway=highway_type,
                    name=road_name
                )
        
        logger.info(f"Loaded graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")
        return G
        
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in map data: {e}")
        return nx.MultiDiGraph()
    except Exception as e:
        logger.error(f"Error loading map data: {e}")
        return nx.MultiDiGraph()

# ========== Graph Utilities ==========

def snap_to_nearest_node(G: nx.MultiDiGraph, lat: float, lng: float) -> Tuple[int, float]:
    """
    Find nearest node to given coordinates
    Returns: (node_id, distance_in_meters)
    """
    if G.number_of_nodes() == 0:
        raise RuntimeError("Graph is empty")
    
    min_distance = float('inf')
    nearest_node = None
    
    for node, attrs in G.nodes(data=True):
        node_lat = float(attrs["y"])
        node_lng = float(attrs["x"])
        distance = haversine_m(lat, lng, node_lat, node_lng)
        
        if distance < min_distance:
            min_distance = distance
            nearest_node = node
    
    return int(nearest_node), float(min_distance)

def _normalize_road_name(v: Any) -> str:
    """Extract road name from various formats"""
    if v is None:
        return ""
    if isinstance(v, (list, tuple)):
        return str(v[0]) if len(v) else ""
    return str(v)

def _bearing_deg(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate bearing (direction) between two points"""
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dlng = math.radians(lng2 - lng1)
    
    y = math.sin(dlng) * math.cos(phi2)
    x = (math.cos(phi1) * math.sin(phi2) -
         math.sin(phi1) * math.cos(phi2) * math.cos(dlng))
    
    brng = math.degrees(math.atan2(y, x))
    return (brng + 360) % 360

def _delta_bearing(b1: float, b2: float) -> float:
    """Calculate signed angle between two bearings (-180..180)"""
    return (b2 - b1 + 540) % 360 - 180

# ========== Turn-by-Turn Navigation ==========

def _build_turn_by_turn_steps(G: nx.MultiDiGraph, path: List[int], edge_pick_attr: str = "travel_time") -> List[Dict]:
    """
    Generate turn-by-turn navigation instructions from path nodes
    """
    if not path or len(path) < 2:
        return []
    
    def node_latlng(n: int) -> Tuple[float, float]:
        return float(G.nodes[n]["y"]), float(G.nodes[n]["x"])
    
    edges = []
    bearings = []
    
    # Collect edges and bearings
    for u, v in zip(path[:-1], path[1:]):
        data = G.get_edge_data(u, v)
        if not data:
            continue
        
        # Pick best edge from multi-edges
        key, best = min(data.items(), key=lambda kv: kv[1].get(edge_pick_attr, 1e18))
        edges.append((u, v, key, best))
        
        lat1, lng1 = node_latlng(u)
        lat2, lng2 = node_latlng(v)
        bearings.append(_bearing_deg(lat1, lng1, lat2, lng2))
    
    if not edges:
        return []
    
    # Initialize with departure instruction
    _, _, _, first_edge = edges[0]
    current_road = (
        _normalize_road_name(first_edge.get("name")) or
        _normalize_road_name(first_edge.get("ref")) or
        f"Jalan ({_normalize_road_name(first_edge.get('highway'))})" or
        "Jalan tanpa nama"
    )
    
    lat0, lng0 = node_latlng(edges[0][0])
    steps = [{
        "type": "depart",
        "street_name": current_road,
        "distance_m": 0,
        "location": {"lat": lat0, "lng": lng0},
        "instruction": f"Mulai dari {current_road}"
    }]
    
    dist_since_last = 0.0
    
    # Process intermediate steps
    for i in range(1, len(edges)):
        u_prev, v_prev, k_prev, e_prev = edges[i - 1]
        u, v, k, e = edges[i]
        
        dist_since_last += float(e.get("length", 0.0) or 0.0)
        
        # Determine next road name
        next_name = (
            _normalize_road_name(e.get("name")) or
            _normalize_road_name(e.get("ref")) or
            f"Jalan ({_normalize_road_name(e.get('highway'))})" or
            ""
        )
        
        name_changed = bool(next_name) and (next_name != current_road)
        
        # Calculate turn angle
        prev_b = bearings[i - 1]
        cur_b = bearings[i]
        turn = _delta_bearing(prev_b, cur_b)
        is_turn = abs(turn) >= TURN_THRESHOLD_DEG
        
        if not (name_changed or is_turn):
            continue
        
        lat_u, lng_u = node_latlng(u)
        
        # Determine turn type
        if is_turn:
            if abs(turn) >= STRONG_TURN_THRESHOLD_DEG:
                mtype = "turn-right" if turn > 0 else "turn-left"
            else:
                mtype = "slight-right" if turn > 0 else "slight-left"
        else:
            mtype = "continue"
        
        street_out = next_name if name_changed else current_road
        
        # Build instruction
        if mtype == "continue" and name_changed:
            instr = f"Masuk ke {street_out}"
        elif mtype == "turn-left":
            instr = f"Belok kiri ke {street_out}" if name_changed else "Belok kiri"
        elif mtype == "turn-right":
            instr = f"Belok kanan ke {street_out}" if name_changed else "Belok kanan"
        elif mtype == "slight-left":
            instr = f"Agak kiri ke {street_out}" if name_changed else "Agak kiri"
        elif mtype == "slight-right":
            instr = f"Agak kanan ke {street_out}" if name_changed else "Agak kanan"
        else:
            instr = f"Lurus ke {street_out}" if name_changed else "Lurus"
        
        steps.append({
            "type": mtype,
            "street_name": street_out or current_road,
            "distance_m": round(dist_since_last),
            "location": {"lat": lat_u, "lng": lng_u},
            "instruction": instr,
        })
        
        if name_changed:
            current_road = next_name
        dist_since_last = 0.0
    
    # Final arrival instruction
    lat_last, lng_last = node_latlng(path[-1])
    steps.append({
        "type": "arrive",
        "street_name": current_road,
        "distance_m": round(dist_since_last),
        "location": {"lat": lat_last, "lng": lng_last},
        "instruction": "Tiba di tujuan"
    })
    
    return steps

# ========== Closures & Congestion ==========

def _apply_closures(G: nx.MultiDiGraph, closed_edges: List[Dict]) -> nx.MultiDiGraph:
    """Create copy of graph with closed edges removed"""
    H = G.copy()
    
    if not closed_edges:
        return H
    
    closed_set = {(e.get("u"), e.get("v")) for e in closed_edges}
    
    for u, v in closed_set:
        if u is not None and v is not None and H.has_edge(u, v):
            keys = list(H[u][v].keys())
            for k in keys:
                H.remove_edge(u, v, key=k)
    
    return H

def _apply_congestion(H: nx.MultiDiGraph, congestion_zones: List[Dict]) -> nx.MultiDiGraph:
    """Apply congestion penalty to edges"""
    if not congestion_zones:
        return H
    
    for cz in congestion_zones:
        level = (cz.get("level") or "MODERATE").upper()
        penalty = CONGESTION_PENALTY.get(level, 2.5)
        edges = cz.get("edges", [])
        
        for e in edges:
            u = e.get("u")
            v = e.get("v")
            if u is not None and v is not None and H.has_edge(u, v):
                for k in H[u][v]:
                    orig_tt = float(H[u][v][k].get("travel_time", 0.0) or 0.0)
                    H[u][v][k]["travel_time"] = orig_tt * penalty
    
    return H

# ========== A* Router Class ==========

class AStarRouter:
    """Manual A* implementation for route optimization"""
    
    def __init__(self, graph: nx.MultiDiGraph):
        self.G = graph
        if graph.number_of_nodes() > 0:
            max_speed_mps = MAX_SPEED_KPH * 1000 / 3600
            self.max_speed_mps = max_speed_mps
    
    def astar_route(
        self,
        start_lat: float,
        start_lng: float,
        end_lat: float,
        end_lng: float,
        closed_edges: Optional[List[Dict]] = None,
        mode: str = "fastest",
        congestion_zones: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """
        Calculate route using A* algorithm
        
        Modes:
        - "fastest": minimize travel time
        - "shortest": minimize distance
        """
        
        # Validate mode
        mode = (mode or "fastest").strip().lower()
        if mode not in ("fastest", "shortest"):
            mode = "fastest"
        
        # Apply closures
        H = _apply_closures(self.G, closed_edges or [])
        
        # Apply congestion
        if congestion_zones:
            H = _apply_congestion(H, congestion_zones)
        
        # Snap start and end to nearest nodes
        try:
            start_node, start_dist = snap_to_nearest_node(H, start_lat, start_lng)
            end_node, end_dist = snap_to_nearest_node(H, end_lat, end_lng)
        except RuntimeError as e:
            raise RuntimeError(str(e))
        
        if start_dist > MAX_SNAP_DISTANCE_M:
            raise RuntimeError(f"Start point too far from road network ({start_dist:.0f}m)")
        if end_dist > MAX_SNAP_DISTANCE_M:
            raise RuntimeError(f"End point too far from road network ({end_dist:.0f}m)")
        
        # Define heuristic based on mode
        if mode == "fastest":
            weight_attr = "travel_time"
            
            def heuristic(n1: int, n2: int) -> float:
                y1, x1 = H.nodes[n1]["y"], H.nodes[n1]["x"]
                y2, x2 = H.nodes[n2]["y"], H.nodes[n2]["x"]
                return haversine_m(y1, x1, y2, x2) / self.max_speed_mps
        else:
            weight_attr = "length"
            
            def heuristic(n1: int, n2: int) -> float:
                y1, x1 = H.nodes[n1]["y"], H.nodes[n1]["x"]
                y2, x2 = H.nodes[n2]["y"], H.nodes[n2]["x"]
                return haversine_m(y1, x1, y2, x2)
        
        # Run A*
        try:
            path = nx.astar_path(H, start_node, end_node, heuristic=heuristic, weight=weight_attr)
        except nx.NetworkXNoPath:
            raise RuntimeError("No route found (network disconnected or all routes closed)")
        
        # Build polyline
        polyline = [
            {"lat": float(H.nodes[n]["y"]), "lng": float(H.nodes[n]["x"])}
            for n in path
        ]
        
        # Calculate totals
        total_time = 0.0
        total_len = 0.0
        for u, v in zip(path[:-1], path[1:]):
            data = H.get_edge_data(u, v)
            if not data:
                continue
            key, best = min(data.items(), key=lambda kv: kv[1].get(weight_attr, 1e18))
            total_time += float(best.get("travel_time", 0.0) or 0.0)
            total_len += float(best.get("length", 0.0) or 0.0)
        
        # Generate turn-by-turn steps
        steps = _build_turn_by_turn_steps(H, path, edge_pick_attr=weight_attr)
        
        return {
            "polyline": polyline,
            "total_time_sec": total_time,
            "total_length_m": total_len,
            "steps": steps,
            "path_nodes": [int(n) for n in path],
            "mode": mode,
        }
    
    def astar_route_both(
        self,
        start_lat: float,
        start_lng: float,
        end_lat: float,
        end_lng: float,
        closed_edges: Optional[List[Dict]] = None,
        congestion_zones: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """Generate both fastest and shortest routes"""
        
        # Apply closures and congestion once
        H = _apply_closures(self.G, closed_edges or [])
        if congestion_zones:
            H = _apply_congestion(H, congestion_zones)
        
        # Snap to nodes
        try:
            start_node, _ = snap_to_nearest_node(H, start_lat, start_lng)
            end_node, _ = snap_to_nearest_node(H, end_lat, end_lng)
        except RuntimeError as e:
            raise RuntimeError(str(e))
        
        result = {"fastest": None, "shortest": None}
        
        # FASTEST
        def heuristic_fast(n1: int, n2: int) -> float:
            y1, x1 = H.nodes[n1]["y"], H.nodes[n1]["x"]
            y2, x2 = H.nodes[n2]["y"], H.nodes[n2]["x"]
            return haversine_m(y1, x1, y2, x2) / self.max_speed_mps
        
        try:
            path_fast = nx.astar_path(H, start_node, end_node, heuristic=heuristic_fast, weight="travel_time")
            
            polyline_fast = [
                {"lat": float(H.nodes[n]["y"]), "lng": float(H.nodes[n]["x"])}
                for n in path_fast
            ]
            
            total_time = 0.0
            total_len = 0.0
            for u, v in zip(path_fast[:-1], path_fast[1:]):
                data = H.get_edge_data(u, v)
                if data:
                    _, best = min(data.items(), key=lambda kv: kv[1].get("travel_time", 1e18))
                    total_time += float(best.get("travel_time", 0.0) or 0.0)
                    total_len += float(best.get("length", 0.0) or 0.0)
            
            steps_fast = _build_turn_by_turn_steps(H, path_fast, edge_pick_attr="travel_time")
            
            result["fastest"] = {
                "polyline": polyline_fast,
                "total_time_sec": total_time,
                "total_length_m": total_len,
                "steps": steps_fast,
                "path_nodes": [int(n) for n in path_fast],
                "mode": "fastest",
            }
        except nx.NetworkXNoPath:
            pass
        
        # SHORTEST
        def heuristic_short(n1: int, n2: int) -> float:
            y1, x1 = H.nodes[n1]["y"], H.nodes[n1]["x"]
            y2, x2 = H.nodes[n2]["y"], H.nodes[n2]["x"]
            return haversine_m(y1, x1, y2, x2)
        
        try:
            path_short = nx.astar_path(H, start_node, end_node, heuristic=heuristic_short, weight="length")
            
            polyline_short = [
                {"lat": float(H.nodes[n]["y"]), "lng": float(H.nodes[n]["x"])}
                for n in path_short
            ]
            
            total_time = 0.0
            total_len = 0.0
            for u, v in zip(path_short[:-1], path_short[1:]):
                data = H.get_edge_data(u, v)
                if data:
                    _, best = min(data.items(), key=lambda kv: kv[1].get("length", 1e18))
                    total_time += float(best.get("travel_time", 0.0) or 0.0)
                    total_len += float(best.get("length", 0.0) or 0.0)
            
            steps_short = _build_turn_by_turn_steps(H, path_short, edge_pick_attr="length")
            
            result["shortest"] = {
                "polyline": polyline_short,
                "total_time_sec": total_time,
                "total_length_m": total_len,
                "steps": steps_short,
                "path_nodes": [int(n) for n in path_short],
                "mode": "shortest",
            }
        except nx.NetworkXNoPath:
            pass
        
        if result["fastest"] is None and result["shortest"] is None:
            raise RuntimeError("No route found")
        
        return result
