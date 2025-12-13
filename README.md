# Keystone Ad Ops Platform

A modern full-stack web application for Meta campaign management and performance prediction.

## Features

- **Performance Predictor**: Estimate campaign performance based on historical data
- **Campaign Overview**: Real-time view of active campaigns with key metrics
- **Country-level Analytics**: Detailed breakdowns by country
- **Live Meta API Integration**: Real-time data from Meta Graph API

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Material UI v5
- Plotly.js for visualizations

### Backend
- FastAPI (Python 3.11+)
- PostgreSQL
- SQLAlchemy
- Pydantic

### Deployment
- Docker & Docker Compose
- Cloudflare Tunnel

## Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd Keystone
```

2. **Configure environment**
Run the setup script to interactively configure your environment:
```bash
python3 setup_env.py
```
This will create a `.env` file for you and ask for necessary tokens (Meta, HubSpot, etc.).

3. **Start the application**
```bash
docker-compose up --build
```

4. **Access the platform**
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

## Project Structure

```
Keystone/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── api/      # API routes
│   │   ├── core/     # Configuration
│   │   ├── models/   # Database models
│   │   ├── schemas/  # Pydantic schemas
│   │   └── services/ # Business logic
│   └── Dockerfile
├── frontend/         # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       └── theme.ts
└── docker-compose.yml
```

## License

Proprietary
