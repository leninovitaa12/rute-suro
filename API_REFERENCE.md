# Rute-Suro API Reference

Complete API documentation for the Rute-Suro routing backend.

## Base URL

```
http://localhost:8000
```

## Authentication

Currently, the API is public for reading data. Administrative operations (creating/editing closures, events) are protected by Supabase Row Level Security (RLS).

## Response Format

All responses are JSON:

```json
{
  "data": {...},
  "error": null,
  "status": 200
}
```

Errors return appropriate HTTP status codes with error details.

---

## Navigation Endpoints

### POST /route

Calculate optimal route using A* algorithm.

**Request:**
```json
{
  "start": {
    "lat": -7.8728,
    "lng": 111.4625
  },
  "end": {
    "lat": -7.8752,
    "lng": 111.4625
  },
  "mode": "fastest"
}
```

**Parameters:**
- `start` (required): Starting location {lat, lng}
- `end` (required): Destination location {lat, lng}
- `mode` (optional): Route mode - `"fastest"`, `"shortest"`, or `"both"` (default: `"fastest"`)

**Response (Fastest Mode):**
```json
{
  "polyline": [
    {"lat": -7.8728, "lng": 111.4625},
    {"lat": -7.8730, "lng": 111.4627},
    ...
  ],
  "total_time_sec": 450.5,
  "total_length_m": 2500.0,
  "mode": "fastest",
  "steps": [
    {
      "type": "depart",
      "instruction": "Mulai dari Jalan Ahmad Yani",
      "street_name": "Jalan Ahmad Yani",
      "distance_m": 0,
      "location": {"lat": -7.8728, "lng": 111.4625}
    },
    {
      "type": "turn-right",
      "instruction": "Belok kanan ke Jalan Merdeka",
      "street_name": "Jalan Merdeka",
      "distance_m": 450,
      "location": {"lat": -7.8740, "lng": 111.4640}
    },
    {
      "type": "arrive",
      "instruction": "Tiba di tujuan",
      "street_name": "Jalan Merdeka",
      "distance_m": 2050,
      "location": {"lat": -7.8752, "lng": 111.4625}
    }
  ],
  "path_nodes": [1, 2, 3, 4, 5],
  "closures_active": [],
  "congestion_active": []
}
```

**Response (Both Mode):**
```json
{
  "fastest": { /* as above */ },
  "shortest": { /* alternative route */ }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid input or no route found
- `500` - Server error

---

### GET /nearest-node

Find nearest road point to given coordinates (snap to road).

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude

**Request:**
```
GET /nearest-node?lat=-7.8728&lng=111.4625
```

**Response:**
```json
{
  "node_id": 42,
  "distance_m": 23.5,
  "lat": -7.87285,
  "lng": 111.46252
}
```

---

### GET /map-bootstrap

Get all map data for initialization (events, closures, parking, congestion).

**Request:**
```
GET /map-bootstrap
```

**Response:**
```json
{
  "server_time": "2024-03-19T10:30:00+00:00",
  "ttl_seconds": 30,
  "events": [
    {
      "id": "uuid",
      "title": "Grebeg Suro 2024",
      "description": "...",
      "start_time": "2024-03-26T00:00:00+00:00",
      "end_time": "2024-03-27T00:00:00+00:00",
      "location_lat": -7.8728,
      "location_lng": 111.4625,
      "radius_m": 2000
    }
  ],
  "closures_active": [
    {
      "id": "uuid",
      "reason": "Event preparation",
      "edges": [
        {"u": 1, "v": 2},
        {"u": 2, "v": 3}
      ],
      "start_time": "2024-03-26T00:00:00+00:00",
      "end_time": "2024-03-27T00:00:00+00:00"
    }
  ],
  "congestion_active": [
    {
      "id": "uuid",
      "level": "MODERATE",
      "reason": "Heavy traffic",
      "edges": [
        {"u": 5, "v": 6, "lat": -7.8740, "lng": 111.4630}
      ],
      "start_time": "2024-03-26T10:00:00+00:00",
      "end_time": "2024-03-26T12:00:00+00:00"
    }
  ],
  "parking_spots": [
    {
      "id": "uuid",
      "name": "Parkir Alun-alun",
      "lat": -7.8700,
      "lng": 111.4600,
      "capacity": 200,
      "available": 45
    }
  ]
}
```

---

## Events Management

### GET /events

List all events.

**Query Parameters:**
- `active` (optional): `true` to show only active events

**Request:**
```
GET /events?active=false
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Grebeg Suro 2024",
    "description": "Traditional event",
    "start_time": "2024-03-26T00:00:00+00:00",
    "end_time": "2024-03-27T00:00:00+00:00",
    "location_lat": -7.8728,
    "location_lng": 111.4625,
    "radius_m": 2000,
    "created_at": "2024-03-19T10:00:00+00:00"
  }
]
```

---

### POST /events

Create new event (requires authentication).

**Request:**
```json
{
  "title": "Event Name",
  "description": "Event description",
  "start_time": "2024-03-26T00:00:00Z",
  "end_time": "2024-03-27T00:00:00Z",
  "location_lat": -7.8728,
  "location_lng": 111.4625,
  "radius_m": 2000
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Event Name",
  "description": "Event description",
  "start_time": "2024-03-26T00:00:00+00:00",
  "end_time": "2024-03-27T00:00:00+00:00",
  "location_lat": -7.8728,
  "location_lng": 111.4625,
  "radius_m": 2000,
  "created_at": "2024-03-19T10:30:00+00:00"
}
```

---

### PUT /events/{id}

Update event (requires authentication).

**Request:**
```
PUT /events/550e8400-e29b-41d4-a716-446655440000
```

**Body:**
```json
{
  "title": "Updated Event Name",
  "start_time": "2024-03-26T09:00:00Z",
  "end_time": "2024-03-27T18:00:00Z"
}
```

---

### DELETE /events/{id}

Delete event (requires authentication).

**Request:**
```
DELETE /events/550e8400-e29b-41d4-a716-446655440000
```

---

## Road Closures

### GET /road-closures

List all road closures.

**Query Parameters:**
- `active` (optional): `true` for currently active only

**Response:**
```json
[
  {
    "id": "uuid",
    "event_id": "uuid",
    "reason": "Event setup",
    "start_time": "2024-03-26T00:00:00+00:00",
    "end_time": "2024-03-27T00:00:00+00:00",
    "edges": [
      {"u": 1, "v": 2},
      {"u": 2, "v": 3}
    ],
    "created_at": "2024-03-19T10:00:00+00:00"
  }
]
```

---

### POST /road-closures

Create road closure (requires authentication).

**Request:**
```json
{
  "event_id": "uuid",
  "reason": "Preparation for event",
  "start_time": "2024-03-26T00:00:00Z",
  "end_time": "2024-03-27T00:00:00Z",
  "edges": [
    {"u": 1, "v": 2},
    {"u": 2, "v": 3},
    {"u": 3, "v": 4}
  ]
}
```

**Note:** Use `/admin/derive-edges` to find edges between two points.

---

### PUT /road-closures/{id}

Update road closure.

---

### DELETE /road-closures/{id}

Delete road closure.

---

## Congestion Zones

### GET /congestion-zones

List all congestion zones.

**Query Parameters:**
- `active` (optional): `true` for currently active only

**Response:**
```json
[
  {
    "id": "uuid",
    "event_id": null,
    "level": "MODERATE",
    "reason": "[auto] TomTom realtime",
    "start_time": "2024-03-19T10:30:00+00:00",
    "end_time": "2024-03-19T11:15:00+00:00",
    "edges": [
      {"u": 5, "v": 6, "lat": -7.8740, "lng": 111.4630},
      {"u": 6, "v": 7, "lat": -7.8750, "lng": 111.4635}
    ],
    "created_at": "2024-03-19T10:30:00+00:00"
  }
]
```

---

### POST /congestion-zones

Create congestion zone (admin or traffic sync).

**Request:**
```json
{
  "level": "HEAVY",
  "reason": "Traffic congestion",
  "start_time": "2024-03-19T10:30:00Z",
  "end_time": "2024-03-19T12:00:00Z",
  "edges": [
    {
      "u": 5,
      "v": 6,
      "lat": -7.8740,
      "lng": 111.4630
    }
  ]
}
```

**Level:** `"MODERATE"` (2.5x slower) or `"HEAVY"` (5.0x slower)

---

### PUT /congestion-zones/{id}

Update congestion zone.

---

### DELETE /congestion-zones/{id}

Delete congestion zone.

---

## Parking Spots

### GET /parking-spots

List all parking spots.

**Response:**
```json
[
  {
    "id": "uuid",
    "event_id": "uuid",
    "name": "Parkir Utama",
    "lat": -7.8700,
    "lng": 111.4600,
    "capacity": 200,
    "available": 45,
    "created_at": "2024-03-19T10:00:00+00:00"
  }
]
```

---

### POST /parking-spots

Create parking spot (requires authentication).

**Query Parameters:**
- `name` (required): Parking spot name
- `lat` (required): Latitude
- `lng` (required): Longitude
- `event_id` (optional): Associated event

**Request:**
```
POST /parking-spots?name=Parkir%20Utama&lat=-7.8700&lng=111.4600&event_id=uuid
```

---

### DELETE /parking-spots/{id}

Delete parking spot.

---

## Admin Tools

### POST /admin/derive-edges

Find edges between two map points (useful for creating closures).

**Request:**
```json
{
  "a": {
    "lat": -7.8728,
    "lng": 111.4625
  },
  "b": {
    "lat": -7.8752,
    "lng": 111.4625
  }
}
```

**Response:**
```json
{
  "start_node": 1,
  "end_node": 4,
  "num_edges": 3,
  "edges": [
    {"u": 1, "v": 2},
    {"u": 2, "v": 3},
    {"u": 3, "v": 4}
  ]
}
```

---

## Health Check

### GET /health

Check if server is running.

**Response:**
```json
{
  "status": "healthy",
  "service": "rute-suro-backend"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid input: latitude must be between -90 and 90"
}
```

### 404 Not Found
```json
{
  "detail": "Event not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Route calculation failed"
}
```

---

## Rate Limiting

No rate limiting currently implemented. For production deployment, consider adding:
- 100 requests per minute per IP for public endpoints
- 1000 requests per minute per authenticated user

---

## Pagination

Currently not implemented. All endpoints return full result sets. For large datasets, consider implementing:
- Offset/limit parameters
- Cursor-based pagination
- Response compression

---

## Websocket Support

Not implemented. For real-time updates, consider using:
- Server-Sent Events (SSE)
- WebSocket for live navigation updates
- Firebase Realtime Database

---

## CORS

Currently allows all origins. For production:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

---

## Data Types

### Location Object
```json
{
  "lat": -7.8728,
  "lng": 111.4625
}
```

### Polyline (array of locations)
```json
[
  {"lat": -7.8728, "lng": 111.4625},
  {"lat": -7.8730, "lng": 111.4627}
]
```

### Edge
```json
{
  "u": 1,
  "v": 2
}
```

### Turn-by-Turn Step
```json
{
  "type": "turn-right",
  "instruction": "Belok kanan ke Jalan Merdeka",
  "street_name": "Jalan Merdeka",
  "distance_m": 450,
  "location": {"lat": -7.8740, "lng": 111.4640}
}
```

Step types: `"depart"`, `"arrive"`, `"continue"`, `"turn-left"`, `"turn-right"`, `"slight-left"`, `"slight-right"`

---

## Timestamps

All timestamps are ISO 8601 format with timezone:
```
2024-03-19T10:30:00+00:00
```

---

**Last Updated**: 2024
**API Version**: 1.0.0
