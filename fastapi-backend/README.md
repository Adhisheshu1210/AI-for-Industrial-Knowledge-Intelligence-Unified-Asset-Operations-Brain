# INDUS AI Platform - Enterprise FastAPI Backend Service

This repository houses the production-ready FastAPI backend designed under a **Clean Architecture (Domain-Driven design)** pattern for the INDUS AI platform. 

It provides an enterprise-ready, robust, high-performance API system that couples Google's latest Gemini 2.5/3.5 models with secure user databases, asynchronous worker pools, and memory caching layers.

---

## 🏗️ Clean Architecture Layout
The codebase is strictly modularized to separate core concerns, database schema declarations, service adapters, and endpoint routers:

```text
fastapi-backend/
├── app/
│   ├── api/                 # API controllers, endpoint routers, and dependencies
│   │   ├── deps.py          # Dependency injection (get_db, JWT decoder, RBAC checks)
│   │   └── v1/
│   │       ├── auth.py      # Registration, standard credentials login, Google login
│   │       ├── documents.py # File upload, OCR triggering, Gemini automated tagging
│   │       ├── chat.py      # Senior Copilot conversational engine (RAG grounding)
│   │       ├── compliance.py# EHS safety auditing, clause compliance, remediation logs
│   │       ├── lessons.py   # Tribal Knowledge codification & ISO-9001 standard lessons
│   │       ├── analytics.py # Metric computations & category aggregations
│   │       └── notifications.py # WebSocket router for operator terminals
│   │
│   ├── core/                # System config, security hashing, database adapters, Redis
│   │   ├── config.py        # Pydantic Settings & env configuration
│   │   ├── database.py      # SQLAlchemy Async engine with pool config
│   │   ├── redis.py         # Redis async client for high-performance caches
│   │   └── security.py      # Hashing context & JWT generation
│   │
│   ├── models/              # SQLAlchemy database tables
│   │   ├── user.py          # Account model & enum UserRole
│   │   ├── document.py      # Document model for SOPs and datasheets
│   │   ├── compliance.py    # EHS compliance audit results log
│   │   └── lessons.py       # Formalized tribal knowledge lessons learned
│   │
│   ├── schemas/             # Pydantic validation schemas
│   │   ├── user.py          # Password validation, OAuth payload, token return shapes
│   │   ├── document.py      # Upload & metadata schemas
│   │   ├── chat.py          # Conversation inputs, RAG query sources
│   │   ├── compliance.py    # Audits, finding summaries, risk metrics
│   │   └── lessons.py       # Formalized lessons, guidelines, safety rules
│   │
│   ├── services/            # Business layer & third-party integrations
│   │   ├── auth.py          # Hashing execution and account creation logic
│   │   ├── ocr.py           # Text decoding and OCR processing
│   │   ├── gemini.py        # Gemini client using modern google-genai Client
│   │   └── vector_search.py # RAG dynamic text semantic search similarities
│   │
│   ├── middleware/          # Interceptors and request filters
│   │   └── logging.py       # Structured request logger & processing speed timer
│   │
│   ├── tasks/               # Background task processors
│   │   └── worker.py        # Celery asynchronous task definitions (Heavy OCR, PDFs)
│   │
│   └── main.py              # App boot gateway, Lifespan configuration, WS registering
│
├── Dockerfile               # High-performance multi-stage Docker build
├── requirements.txt         # Package constraints
└── README.md                # Engineering architectural instructions
```

---

## 🔒 Production Security & RBAC
1. **JWT Verification**: Token access uses the `HS256` signature verification standard with custom expiry offsets.
2. **Role-Based Authorization**: Integrates explicit permissions checking on specific router endpoints (e.g., `Operator`, `Maintenance Engineer`, `EHS Auditor`, `System Admin`).
3. **No Key Leakage**: API Keys and OAuth credentials exist purely on the container side and are never returned to client interfaces.

---

## 🚀 Installation & Local Launch

### 1. Configure the Environment variables (`.env`)
```env
PROJECT_NAME="INDUS AI Platform"
SECRET_KEY="replace_with_a_secure_long_secret_hash_value"
GEMINI_API_KEY="AIzaSy..."
POSTGRES_SERVER="localhost"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="secure_postgres_password"
POSTGRES_DB="indus_ai"
POSTGRES_PORT="5432"
REDIS_HOST="localhost"
REDIS_PORT=6379
```

### 2. Standup PostgreSQL & Redis (Docker Compose)
```bash
docker run --name indus-db -e POSTGRES_PASSWORD=secure_postgres_password -e POSTGRES_DB=indus_ai -p 5432:5432 -d postgres:15
docker run --name indus-cache -p 6379:6379 -d redis:7-alpine
```

### 3. Spin up Virtualenv & Install dependencies
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Run the Dev Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Open Swagger Interactive Docs: `http://localhost:8000/docs`
- Open ReDoc Docs: `http://localhost:8000/redoc`

---

## 🐳 Docker Deployment Setup
To build and run the multi-stage production Docker container:
```bash
docker build -t indus-backend:latest .
docker run -p 8000:8000 --env-file .env indus-backend:latest
```

---

## 🔄 Async Background Workers
To run the background workers pool (OCR processing, PDF compilation):
```bash
celery -A app.tasks.worker.celery_app worker --loglevel=info
```
