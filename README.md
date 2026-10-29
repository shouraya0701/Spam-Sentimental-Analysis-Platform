# 🛡️ TextGuard — AI Spam & Sentiment Analysis Engine

> **A full-stack, local machine-learning-powered text classification and analytics platform.** Built with FastAPI, PostgreSQL, Scikit-learn, and a Vite-powered multi-page React island architecture.

---

## 📌 Project Overview

**TextGuard** is an intelligent text classification web application designed to evaluate and analyze text (emails, SMS, customer reviews, messages) simultaneously across two independent machine learning dimensions:

1. **Spam Detection**: Classifies text as **`SPAM`** or **`HAM`** with confidence scoring.
2. **Sentiment Analysis**: Evaluates tone as **`POSITIVE`** or **`NEGATIVE`** with confidence scoring.

### Key Highlights
- **100% Local Inference**: Zero third-party paid AI APIs. Models are trained on disk and loaded in-memory once on startup for sub-millisecond predictions.
- **Strict Data Isolation**: Multi-tenant database design where every user's history and analytics are isolated via foreign key checks and authenticated sessions.
- **Hybrid Frontend Architecture**: Multi-page application (MPA) served by Vite using lightweight Vanilla JavaScript for authentication and React islands for dynamic interactive widgets.
- **Modern Gen-Z Creative Aesthetic**: Inspired by the 108™ design language featuring deep pitch black backgrounds, acid neon lime accents, and dual typography (Poppins + Space Grotesk).

---

## 🛠️ Tech Stack

### Backend
- **Python 3.11+**
- **FastAPI**: Modern, high-performance web framework.
- **SQLAlchemy 2.x**: Sync ORM with declarative typed mappings.
- **PostgreSQL (`psycopg2-binary`)**: Production-grade relational database.
- **Alembic**: Database migrations and version tracking.
- **Pydantic v2 & `pydantic-settings`**: Schema validation and environment management.
- **Scikit-learn & Pandas**: TF-IDF vectorization and Logistic Regression classification pipelines.
- **Security**: JWT authentication (`python-jose`) via `HTTPBearer` and password hashing with `passlib[bcrypt]`.
- **Uvicorn**: ASGI server.

### Frontend
- **Vite 5**: Fast multi-page dev server and bundler.
- **Vanilla JavaScript (ES Modules)**: For lightweight auth pages (`login.html`, `register.html`) and shared utilities (`src/lib/`).
- **React 18 (JavaScript + JSX)**: Isolated islands for interactive pages (`index.html`, `history.html`, `stats.html`).
- **Recharts**: Data visualization (Pie charts and daily bar chart).
- **Custom CSS**: Single shared stylesheet with CSS variables and responsive design.

---

## 📂 Project Structure

```
textguard/
├── .gitignore
├── README.md
├── backend/
│   ├── .env                      # Environment secrets (never committed)
│   ├── .env.example              # Template configuration
│   ├── requirements.txt          # Pinned Python packages
│   ├── alembic.ini               # Alembic configuration
│   ├── alembic/
│   │   ├── env.py                # Database connection for migrations
│   │   ├── script.py.mako        # Migration template
│   │   └── versions/             # Migration version scripts
│   ├── ml/
│   │   ├── train.py              # UCI dataset downloader & pipeline trainer
│   │   ├── data/                 # Raw downloaded datasets (gitignored)
│   │   └── models/               # spam_model.joblib & sentiment_model.joblib
│   └── app/
│       ├── main.py               # FastAPI entry point, lifespan, CORS
│       ├── core/
│       │   ├── config.py         # Settings via pydantic-settings
│       │   └── security.py       # Password hashing & JWT helpers
│       ├── db/
│       │   ├── base.py           # Declarative Base
│       │   └── session.py        # SQLAlchemy engine & session factory
│       ├── models/
│       │   ├── user.py           # User table model
│       │   └── analysis.py       # Analysis table model
│       ├── schemas/
│       │   ├── user.py           # Pydantic auth schemas
│       │   └── analysis.py       # Pydantic analysis & stats schemas
│       ├── api/
│       │   ├── deps.py           # get_db & get_current_user dependencies
│       │   └── routes/
│       │       ├── auth.py       # Register, Login, Me routes
│       │       └── analysis.py   # Analyze, History, Delete, Stats routes
│       └── services/
│           ├── auth_service.py   # User creation & credential check
│           ├── analysis_service.py # Database queries & SQL aggregations
│           └── ml_service.py     # Model loading & inference logic
└── frontend/
    ├── package.json              # Pinned npm dependencies
    ├── vite.config.js            # Multi-page configuration + React plugin
    ├── .env                      # VITE_API_URL=http://localhost:8000/api/v1
    ├── login.html                # Vanilla JS login page
    ├── register.html             # Vanilla JS register page
    ├── index.html                # Analyze page (React island)
    ├── history.html              # History page (React island)
    ├── stats.html                # Analytics page (React island)
    └── src/
        ├── css/
        │   └── style.css         # Single shared dark aesthetic stylesheet
        ├── lib/                  # Plain JS modules
        │   ├── config.js         # API base URL configuration
        │   ├── api.js            # Authenticated native fetch wrapper
        │   ├── auth.js           # Token & session helpers
        │   ├── navbar.js         # Safe dynamic navbar rendering
        │   └── format.js         # Date, string & percentage formatters
        └── pages/
            ├── login.js          # Login form logic
            ├── register.js       # Register form logic
            ├── analyze.jsx       # Analyze text island
            ├── history.jsx       # History list with pagination & delete
            └── stats.jsx         # Summary cards & Recharts visualization
```

---

## 🤖 Machine Learning Models & Metrics

The models are trained using `backend/ml/train.py` from verified UCI Machine Learning Repositories:

### 1. Spam Classification Model
- **Dataset**: UCI SMS Spam Collection (5,169 cleaned samples)
- **Architecture**: `Pipeline([('tfidf', TfidfVectorizer(ngram_range=(1,2), max_features=5000, stop_words='english')), ('clf', LogisticRegression(class_weight='balanced'))])`
- **Stratified Split**: 80% train / 20% test
- **Test Accuracy**: **97.29%** (Macro F1: 0.94)
- **Saved As**: `backend/ml/models/spam_model.joblib`

### 2. Sentiment Analysis Model
- **Dataset**: UCI Sentiment Labelled Sentences (IMDb, Amazon, Yelp — 2,731 cleaned samples)
- **Architecture**: `Pipeline([('tfidf', TfidfVectorizer(ngram_range=(1,2), max_features=5000)), ('clf', LogisticRegression())])`
- **Important**: Stop words are **preserved** (not stripped) because negation words like *"not"*, *"never"*, *"no"* invert sentiment meanings.
- **Stratified Split**: 80% train / 20% test
- **Test Accuracy**: **80.07%** (Macro F1: 0.80)
- **Saved As**: `backend/ml/models/sentiment_model.joblib`

---

## 🚀 Setup & Installation Guide

### Step 1: Clone or Open the Repository
```bash
cd "Project2(Sentiment Analysis)"
```

### Step 2: Database Setup (PostgreSQL)
Ensure PostgreSQL is running locally on port `5432`. Create a new database named `Sentiment` (or `textguard`):
```sql
CREATE DATABASE "Sentiment";
```

### Step 3: Backend Setup
1. Navigate to the backend directory:
   ```powershell
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```powershell
   python -m venv .venv
   .venv\Scripts\activate
   ```
3. Install backend dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
4. Configure `.env`:
   Create `.env` inside `backend/` (copy from `.env.example`):
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/Sentiment
   SECRET_KEY=generate-a-long-random-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   FRONTEND_URL=http://localhost:5173
   ```
5. Apply database migrations:
   ```powershell
   alembic upgrade head
   ```
6. Download datasets & train ML models:
   ```powershell
   python ml/train.py
   ```
7. Start the FastAPI backend server:
   ```powershell
   uvicorn app.main:app --reload
   ```
   *Swagger Docs will be live at: [http://localhost:8000/docs](http://localhost:8000/docs)*

---

### Step 4: Frontend Setup
1. Open a **second terminal** and navigate to the `frontend/` directory:
   ```powershell
   cd frontend
   ```
2. Install npm packages:
   ```powershell
   npm install
   ```
3. Verify `frontend/.env` points to the API:
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   ```
4. Start the Vite development server:
   ```powershell
   npm run dev
   ```
5. Open your browser and navigate to:
   - **Register**: [http://localhost:5173/register.html](http://localhost:5173/register.html)
   - **Login**: [http://localhost:5173/login.html](http://localhost:5173/login.html)
   - **Analyze**: [http://localhost:5173/index.html](http://localhost:5173/index.html)
   - **History**: [http://localhost:5173/history.html](http://localhost:5173/history.html)
   - **Analytics & Stats**: [http://localhost:5173/stats.html](http://localhost:5173/stats.html)

---

## 📡 API Reference (`/api/v1`)

| Method | Endpoint | Auth | Description | Status Codes |
|---|---|:---:|---|---|
| `POST` | `/auth/register` | No | Creates a new user account (normalizes email to lowercase). | `201`, `409`, `422` |
| `POST` | `/auth/login` | No | Authenticates credentials and returns a Bearer JWT token. | `200`, `401`, `422` |
| `GET` | `/auth/me` | Yes | Retrieves current user profile (`id`, `name`, `email`, `created_at`). | `200`, `401` |
| `POST` | `/analyze` | Yes | Runs spam + sentiment prediction, saves and returns result. | `201`, `401`, `422`, `503` |
| `GET` | `/history` | Yes | Returns user's paginated analyses (`limit`, `offset`, newest first). | `200`, `401` |
| `DELETE`| `/history/{id}` | Yes | Deletes an analysis record belonging to the user. | `204`, `401`, `404` |
| `GET` | `/stats` | Yes | Aggregated counts & 7-day SQL activity breakdown. | `200`, `401` |
| `GET` | `/health` | No | Liveness probe (`{"status": "ok"}`). | `200` |

---

## 🔒 Security & Data Integrity

- **Password Encryption**: Stored strictly as salted bcrypt hashes.
- **Tenant Isolation**: Every database operation on the `analyses` table explicitly filters on `Analysis.user_id == current_user.id`.
- **404 Ownership Masking**: Attempting to delete a record belonging to another user returns a generic `404 Not Found` rather than `403 Forbidden`, preventing resource enumeration attacks.
- **XSS Prevention**: Vanilla JS DOM operations exclusively utilize `textContent` and `createElement`. React strictly avoids `dangerouslySetInnerHTML`.
- **Secrets Management**: `.env` is gitignored; sensitive keys are never exposed in client bundles or API error responses.

---

## 📄 License
This project is open-source and built for educational and resume presentation purposes.

