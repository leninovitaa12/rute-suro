# Rute-Suro Installation & Setup Guide

Complete guide for setting up the Rute-Suro routing optimization system.

## Project Structure

```
rute-suro/
├── backend/                  # FastAPI Backend
│   ├── main.py              # FastAPI application entry point
│   ├── navigation_engine.py  # A* algorithm implementation
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Environment variables template
│   ├── supabase_setup.sql    # Database schema
│   └── data/
│       └── map_data.json     # Road network data (GeoJSON)
├── src/                      # React Frontend (Vite)
│   ├── pages/
│   │   ├── App.jsx
│   │   ├── guest/
│   │   │   ├── HomePage.jsx
│   │   │   ├── UserMapPage.jsx
│   │   │   ├── JadwalPage.jsx
│   │   │   ├── SejarahPage.jsx
│   │   │   └── TentangPage.jsx
│   │   └── admin/
│   │       ├── AdminLogin.jsx
│   │       ├── AdminDashboard.jsx
│   │       └── ...
│   ├── components/
│   ├── main.jsx
│   └── style.css
├── package.json              # Frontend dependencies
├── vite.config.js           # Vite configuration
└── README.md
```

## Prerequisites

- Python 3.9+
- Node.js 18+ (for frontend)
- PostgreSQL/Supabase account
- Git

## Backend Setup

### Step 1: Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Or using Python virtual environment (recommended):

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Save your project URL and API keys
3. Go to SQL Editor in Supabase dashboard
4. Copy all SQL from `backend/supabase_setup.sql`
5. Run it in the SQL Editor to create tables

### Step 3: Configure Environment Variables

Create `.env` in the `backend/` directory:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your values:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-from-supabase
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase

# FastAPI
DEBUG=True
PORT=8000
HOST=0.0.0.0

# Map Data
MAP_DATA_PATH=./data/map_data.json

# A* Settings
MAX_SNAP_DISTANCE_M=500
MAX_SPEED_KPH=70
TURN_THRESHOLD_DEG=25
STRONG_TURN_THRESHOLD_DEG=60

# Optional: TomTom API (for future traffic integration)
TOMTOM_API_KEY=
```

### Step 4: Start Backend Server

```bash
cd backend
python main.py
```

The server will start at `http://localhost:8000`

API documentation available at `http://localhost:8000/docs`

## Frontend Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Frontend API

Create `.env` in the root directory (if not exists):

```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key
```

### Step 3: Update Supabase Client

Edit `src/services/supabase.js` (create if not exists):

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### Step 4: Start Frontend Development Server

```bash
npm run dev
```

Frontend will start at `http://localhost:5173`

## Running Both Servers

### Option 1: Two Terminal Windows

Terminal 1 (Backend):
```bash
cd backend
python main.py
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### Option 2: Using Concurrently (Optional)

Install globally:
```bash
npm install -g concurrently
```

Create `package.json` script:
```json
{
  "scripts": {
    "dev": "concurrently \"cd backend && python main.py\" \"npm run dev:frontend\"",
    "dev:frontend": "vite"
  }
}
```

Then run:
```bash
npm run dev
```

## API Endpoints

### Navigation

- `POST /route` - Calculate route with A* algorithm
- `GET /nearest-node?lat=X&lng=Y` - Find nearest road point
- `GET /map-bootstrap` - Get all map data for initialization

### Events Management

- `GET /events` - List all events
- `POST /events` - Create event (admin)
- `PUT /events/{id}` - Update event (admin)
- `DELETE /events/{id}` - Delete event (admin)

### Road Closures (Admin)

- `GET /road-closures` - List closures
- `POST /road-closures` - Create closure (admin)
- `PUT /road-closures/{id}` - Update closure (admin)
- `DELETE /road-closures/{id}` - Delete closure (admin)

### Congestion Zones

- `GET /congestion-zones` - List congestion
- `POST /congestion-zones` - Create zone (admin/traffic sync)
- `PUT /congestion-zones/{id}` - Update zone (admin)
- `DELETE /congestion-zones/{id}` - Delete zone (admin)

### Parking Spots

- `GET /parking-spots` - List parking
- `POST /parking-spots` - Create spot (admin)
- `DELETE /parking-spots/{id}` - Delete spot (admin)

### Admin Tools

- `POST /admin/derive-edges` - Find edges between two points (for closures)

## Testing the System

### 1. Test Health Check

```bash
curl http://localhost:8000/health
```

### 2. Get All Events

```bash
curl http://localhost:8000/events
```

### 3. Calculate Route

```bash
curl -X POST http://localhost:8000/route \
  -H "Content-Type: application/json" \
  -d '{
    "start": {"lat": -7.8728, "lng": 111.4625},
    "end": {"lat": -7.8752, "lng": 111.4625},
    "mode": "fastest"
  }'
```

### 4. Get Nearest Road Point

```bash
curl "http://localhost:8000/nearest-node?lat=-7.8728&lng=111.4625"
```

### 5. Get Map Bootstrap Data

```bash
curl http://localhost:8000/map-bootstrap
```

## Frontend Features

### User Interface

1. **Home Page** - Landing page with navigation to features
2. **Map Page** - Interactive map with:
   - Route calculation
   - Real-time navigation
   - Event markers
   - Closed road visualization
   - Congestion zones
   - Parking spots

3. **Event Calendar** - View upcoming events
4. **About Page** - Event information

### Admin Dashboard

1. **Event Management** - Create/edit/delete events
2. **Road Closures** - Mark closed roads
3. **Congestion Monitoring** - View and manage congestion zones
4. **Route Analytics** - View popular routes

## Database Schema

### Events Table
- `id` - UUID primary key
- `title`, `description` - Event details
- `start_time`, `end_time` - Event schedule
- `location_lat`, `location_lng` - Center point
- `radius_m` - Event radius in meters

### Road Closures Table
- `id` - UUID primary key
- `event_id` - Reference to event
- `reason` - Why road is closed
- `start_time`, `end_time` - Closure period
- `edges` - JSONB array of {u, v} node pairs

### Congestion Zones Table
- `id` - UUID primary key
- `level` - MODERATE or HEAVY
- `reason` - Reason for congestion
- `start_time`, `end_time` - Duration
- `edges` - JSONB array with node and location data

### Parking Spots Table
- `id` - UUID primary key
- `event_id` - Reference to event
- `name` - Parking spot name
- `lat`, `lng` - Coordinates
- `capacity`, `available` - Capacity info

## A* Algorithm Details

### Heuristic Function

Uses **Haversine Distance** formula for estimated cost to goal:

```
h(n) = distance(n, goal) / max_speed_mps
```

### Cost Function

- **Fastest mode**: Minimizes `travel_time` (seconds)
- **Shortest mode**: Minimizes `length` (meters)

### Admissibility

The heuristic never overestimates actual cost because:
- Maximum possible speed is capped at `MAX_SPEED_KPH`
- Haversine distance is straight-line distance (always ≤ actual road distance)

### Congestion Handling

When congestion zones are detected:
- Travel time is multiplied by penalty factor:
  - MODERATE: 2.5x slower
  - HEAVY: 5.0x slower
- A* automatically avoids congested routes

### Road Closures

Closed edges are removed from graph before pathfinding:
- Makes closed roads impassable
- A* finds alternative routes
- System becomes disconnected if no alternate exists

## Troubleshooting

### Backend Won't Start

```bash
# Check Python version
python --version

# Check if port 8000 is available
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Clear cache and reinstall
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Supabase Connection Fails

1. Verify API keys in `.env`
2. Check Supabase project is active
3. Verify tables exist: `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`
4. Check RLS policies in Supabase dashboard

### Frontend Can't Connect to Backend

```bash
# Check backend is running
curl http://localhost:8000/health

# Update VITE_API_URL in .env
# Check browser console for CORS errors
# Verify both servers are on correct ports
```

### Map Doesn't Show Routes

1. Check `map_data.json` exists in `backend/data/`
2. Verify coordinates in the GeoJSON are valid
3. Check browser console for errors
4. Test `/nearest-node` endpoint directly

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_KEY` | Anon key for client | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server | `eyJhbG...` |
| `DEBUG` | Flask debug mode | `True` |
| `PORT` | FastAPI port | `8000` |
| `MAP_DATA_PATH` | Path to map GeoJSON | `./data/map_data.json` |
| `MAX_SNAP_DISTANCE_M` | Max distance to snap point to road | `500` |
| `MAX_SPEED_KPH` | Max speed for heuristic | `70` |
| `TURN_THRESHOLD_DEG` | Min angle for turn | `25` |

## Performance Tips

1. **Graph Loading**: First request takes longer as graph is loaded. Subsequent requests are fast.
2. **Caching**: Use browser cache for static map tiles
3. **Request Optimization**: Batch multiple queries in `/map-bootstrap`
4. **Database Indexes**: All main tables have indexes on foreign keys and timestamps

## Security Considerations

1. **RLS Policies**: Database is protected with Row Level Security
2. **Environment Variables**: Never commit `.env` to git
3. **API Keys**: Use different keys for different environments (dev, staging, prod)
4. **Admin Routes**: Protected via Supabase auth in RLS policies
5. **CORS**: Configure for your domain in production

## Next Steps

1. Load real map data from OpenStreetMap export or use provided sample
2. Set up admin authentication in frontend
3. Configure TomTom API for real-time traffic (optional)
4. Deploy to Vercel (frontend) and Railway/Heroku (backend)
5. Set up traffic sync background job for continuous updates

## Support

- **Backend Issues**: Check FastAPI docs at `/docs` endpoint
- **Database Issues**: Check Supabase dashboard
- **Frontend Issues**: Check browser console and network tab
- **Algorithm Issues**: Debug A* with test routes in console

---

**Last Updated**: 2024
**Version**: 1.0.0
