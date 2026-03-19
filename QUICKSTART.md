# Rute-Suro Quick Start Guide (5 minutes)

Get up and running in less than 5 minutes.

## Prerequisites
- Python 3.9+
- Node.js 18+
- Supabase account (free tier is fine)

## Step 1: Setup Supabase (2 minutes)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for project to be ready
3. Go to Settings → API → Copy:
   - `SUPABASE_URL`
   - `SUPABASE_KEY` (anon key)
   - `SUPABASE_SERVICE_ROLE_KEY`

4. Go to SQL Editor and run all SQL from `backend/supabase_setup.sql`

## Step 2: Configure Backend (1 minute)

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
DEBUG=True
PORT=8000
MAP_DATA_PATH=./data/map_data.json
```

## Step 3: Start Backend (1 minute)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Backend running at `http://localhost:8000`

Test it:
```bash
curl http://localhost:8000/health
```

## Step 4: Start Frontend (1 minute)

New terminal:
```bash
npm install
npm run dev
```

Frontend running at `http://localhost:5173`

## Done! 

Open `http://localhost:5173` and start navigating!

---

## Testing the System

### Test Route Calculation

```bash
curl -X POST http://localhost:8000/route \
  -H "Content-Type: application/json" \
  -d '{
    "start": {"lat": -7.8728, "lng": 111.4625},
    "end": {"lat": -7.8752, "lng": 111.4625},
    "mode": "fastest"
  }'
```

### View API Docs

Go to `http://localhost:8000/docs`

### Check Database

1. Go to Supabase dashboard
2. Table Editor
3. See `events`, `road_closures`, `congestion_zones` tables

---

## Next Steps

1. **Load Real Map Data**: Replace `data/map_data.json` with actual OSM data
2. **Deploy**: Push to GitHub, deploy on Vercel (frontend) + Railway (backend)
3. **Setup Admin**: Create admin user via Supabase Auth
4. **Customize**: Update event name, colors, map bounds

---

## Troubleshooting

### Backend won't start
```bash
# Check port is free
lsof -i :8000

# Check Python version
python --version
```

### Supabase connection fails
- Verify `.env` has correct keys
- Check Supabase project is running
- Check all tables were created

### Frontend can't connect
- Verify backend is running (`curl http://localhost:8000/health`)
- Check browser console for errors
- Try disabling CORS in dev tools

### Map doesn't load
- Verify `data/map_data.json` exists
- Check GeoJSON coordinates are valid
- Test `/nearest-node` endpoint

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `backend/main.py` | FastAPI server |
| `backend/navigation_engine.py` | A* algorithm |
| `backend/data/map_data.json` | Road network data |
| `src/pages/guest/UserMapPage.jsx` | Map UI |
| `src/pages/admin/AdminDashboard.jsx` | Admin panel |

---

## API Quick Reference

| Endpoint | Method | Example |
|----------|--------|---------|
| `/route` | POST | Calculate route |
| `/events` | GET | List events |
| `/map-bootstrap` | GET | Get all data |
| `/road-closures` | POST | Create closure (admin) |
| `/docs` | GET | API documentation |

---

## Environment Variables Cheatsheet

```env
# REQUIRED
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# OPTIONAL (defaults shown)
DEBUG=True
PORT=8000
MAP_DATA_PATH=./data/map_data.json
MAX_SNAP_DISTANCE_M=500
MAX_SPEED_KPH=70
```

---

## Common Tasks

### Create Event
```bash
curl -X POST http://localhost:8000/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Event",
    "start_time": "2024-03-26T00:00:00Z",
    "end_time": "2024-03-27T00:00:00Z",
    "location_lat": -7.8728,
    "location_lng": 111.4625,
    "radius_m": 2000
  }'
```

### Create Road Closure
```bash
# Step 1: Get edges
curl -X POST http://localhost:8000/admin/derive-edges \
  -H "Content-Type: application/json" \
  -d '{
    "a": {"lat": -7.8728, "lng": 111.4625},
    "b": {"lat": -7.8752, "lng": 111.4625}
  }'

# Step 2: Create closure with edges from step 1
curl -X POST http://localhost:8000/road-closures \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Road work",
    "start_time": "2024-03-26T00:00:00Z",
    "end_time": "2024-03-27T00:00:00Z",
    "edges": [{"u": 1, "v": 2}]
  }'
```

---

## Need Help?

- **Detailed Setup**: See `INSTALLATION.md`
- **API Reference**: See `API_REFERENCE.md`
- **Full README**: See `COMPLETE_README.md`
- **API Docs**: Go to `http://localhost:8000/docs`

---

Happy navigating! 🗺️
