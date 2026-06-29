# Krishi Drishti — Smart Agriculture & Crop Analytics Platform

A full-stack analytics platform for the Smart Agriculture & Crop Analytics
hackathon set. The backend implements all four tasks in Python (ETL,
heap-sort ranking, dashboard analytics, risk mapping) and exposes them as a
REST API; the React frontend renders an interactive dashboard inspired by
[upag.gov.in](https://www.upag.gov.in/).

## Project structure

```
agri-platform/
├── backend/                     FastAPI backend (PEP8)
│   ├── app/
│   │   ├── main.py              API routes, app wiring
│   │   ├── task1_etl/etl.py     Pandas ETL: generation, cleaning, enrichment
│   │   ├── task2_ranking/ranking.py   Heap sort + binary search ranking
│   │   ├── task3_dashboard/dashboard.py  Matplotlib PNG + chart JSON feed
│   │   ├── task4_riskmap/riskmap.py      Folium HTML + map JSON feed
│   │   ├── chatbot/chat.py      Groq-backed Q&A grounded in pipeline data
│   │   └── outputs/              Generated crop_census.csv / PNG / HTML
│   ├── .env.example             Groq API key + model config
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                    React (Vite) frontend
│   ├── src/
│   │   ├── App.jsx, api.js
│   │   └── components/          Navbar, Overview, RankingTable,
│   │                            CropDashboard, RiskMap, CropIcon, StatCard
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

## Run with Docker (recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000 (docs at /docs)

## Run locally without Docker

**Backend**

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env       # then edit .env and paste your GROQ_API_KEY
uvicorn app.main:app --reload --port 8000
```

> Get a free Groq API key at https://console.groq.com/keys and paste it
> into `backend/.env`. Without it the chatbot button still renders, but
> sending a message returns a 503.

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

The frontend reads `VITE_API_BASE_URL` (defaults to `http://localhost:8000`)
to reach the backend — set it in a `.env` file inside `frontend/` if your
backend runs elsewhere.

## API summary

| Endpoint                     | Description                                  |
|-------------------------------|-----------------------------------------------|
| `GET /api/etl/summary`        | Headline ETL stats                            |
| `GET /api/etl/records`        | Full cleaned dataset                          |
| `POST /api/etl/refresh`       | Re-runs ETL → ranking → dashboard → risk map  |
| `GET /api/ranking`            | Heap-sorted state rankings                    |
| `GET /api/ranking/search`     | Binary-search a state's rank (`?state=`)      |
| `GET /api/dashboard`          | Chart-ready JSON for all 4 dashboard panels   |
| `GET /api/riskmap`            | Map markers with colour/score/water status    |
| `GET /api/riskmap/summary`    | Counts by risk band                           |
| `POST /api/chat`              | Krishi Sahayak chatbot (Groq-grounded Q&A)    |
| `GET /outputs/crop_census.csv`| Evaluator deliverable: cleaned CSV            |
| `GET /outputs/agri_dashboard.png` | Evaluator deliverable: 4-panel PNG       |
| `GET /outputs/agri_risk_map.html` | Evaluator deliverable: Folium HTML map   |
