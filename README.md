# LifeFix

LifeFix is a personal problem-solving application for everyday, low-risk practical problems.

When everyday difficulties arise (such as technical software glitches, household organization challenges, or study productivity hurdles), users often encounter generic, unstructured chatbot responses or fragmented search results. LifeFix provides a calm, focused workspace that accepts natural-language problem descriptions in English or Arabic, retrieves verified reference cases from a curated knowledge base, and delivers clear, structured step-by-step guidance with estimated duration and difficulty ratings.

### Important Positioning and Boundaries
- **Everyday Focus:** Designed specifically for low-risk practical situations (technology, study and productivity, home and living, travel, personal finance, food and cooking, personal organization).
- **Non-Healthcare:** LifeFix is **not** a healthcare application and is **not** a medical diagnosis or treatment system.
- **No Legal or Financial Advice:** LifeFix does **not** provide legal counsel or formal financial investment recommendations.
- **Not a Generic Chatbot:** The interface is built around structured action steps rather than endless conversational chat bubbles.
- **Safe Fallback:** If cloud language models are unavailable, LifeFix relies on a deterministic fallback grounded directly in verified database solutions.

---

## 1. Features

| Feature | Description |
| :--- | :--- |
| **Natural-Language Input** | Users describe problems in their own words in either English or Arabic. |
| **Multilingual Semantic Retrieval** | Uses `intfloat/multilingual-e5-small` dense embeddings and pgvector cosine distance. |
| **Retrieval-Augmented Generation (RAG)** | Assembles relevant knowledge-base cases and solutions into grounded context. |
| **Structured Solutions** | Returns structured guidance: understanding statement, causes, numbered steps, warnings, and follow-up questions. |
| **Confidence-Aware Safe Fallbacks** | Employs a development confidence threshold (0.82) and substantive overlap checks to prevent irrelevant projections. |
| **Deterministic Fallback Engine** | Provides reliable database-grounded guidance when the language model is unreachable. |
| **User Authentication** | Secure registration and login using salted bcrypt password hashing and JWT access tokens. |
| **Attempt History & Details** | Authenticated users can browse their previous problem attempts and review complete guidance. |
| **User Feedback** | Simple helpfulness evaluation (Yes/No), satisfaction rating (1 to 5 stars), and optional comments. |
| **Recursive Refinement** | Allows users to submit additional context on unsuccessful attempts, creating linked child attempts. |
| **Holographic Glass Interface** | A modern pearlescent, translucent liquid-glass aesthetic with responsive styling and RTL support. |

### The Refinement Concept
When an initial solution does not fully resolve an issue, LifeFix preserves attempt lineage rather than losing context:

```
Problem A
   ↓
Initial Solution (Attempt A)
   ↓
User reports solution did not resolve the issue (was_successful = False)
   ↓
User provides additional context ("I tried step 2, but the application crashed again")
   ↓
Refined Solution (Attempt B, linked to Parent Attempt A)
   ↓
Further refinement can continue (Attempt B → Attempt C)
```

---

## 2. How It Works

The core problem-solving pipeline processes user submissions through the following sequence:

```
User Problem Input
      ↓
Multilingual Embedding (multilingual-e5-small, 384 dimensions)
      ↓
Semantic Search with pgvector (cosine distance <=> operator)
      ↓
Relevant Knowledge-Base Cases & Solutions Loaded (Batch SQL)
      ↓
Confidence & Relevance Evaluation (0.82 threshold & substantive overlap)
      ↓
RAG Context Assembly
      ↓
Structured Solution Generation (Gemini 2.5 Flash / Deterministic Fallback)
      ↓
Pydantic Schema Validation (LifeFixSolutionResponse)
      ↓
Database Persistence (ProblemAttempt with parent lineage)
      ↓
Structured Solution Displayed to User
      ↓
User Feedback & Optional Refinement
```

### Deterministic Fallback and Safe Boundaries
- **LLM Unavailability:** If the Gemini API is unreachable due to network timeouts, service constraints, or missing API keys, LifeFix does not fail. Instead, it activates a deterministic fallback engine that constructs a structured response directly from verified database solution steps.
- **Low Confidence or Irrelevant Queries:** If a query falls below the development confidence threshold (0.82) or lacks substantive keyword overlap with catalog problems, the system refuses to blindly project the nearest database case. It returns a safe exploratory response advising appropriate boundaries and asking targeted clarifying questions.

---

## 3. Architecture

LifeFix is organized as a decoupled single-page application and REST API:

```
React + TypeScript + Vite (Client Application)
        ↓  HTTP / REST (JSON, Bearer JWT)
FastAPI Backend (Python 3.12)
        ↓
PostgreSQL 16 + pgvector (Relational & Vector Storage)
        ↓
Semantic Retrieval (HNSW Cosine Similarity Index)
        ↓
RAG Context Construction (Batch SQL)
        ↓
Gemini 2.5 Flash / Deterministic Knowledge Fallback
        ↓
Structured Response Validation (Pydantic v2)
        ↓
React Client View (Interactive Frosted UI)
```

- **Frontend Client:** React 19 single-page application built with Vite and TypeScript. Manages local state, protected routes, and authentication tokens, communicating via Axios.
- **Backend API:** FastAPI application providing asynchronous REST endpoints, dependency injection, and Pydantic validation.
- **Database & Vector Engine:** PostgreSQL 16 equipped with the pgvector extension, using HNSW vector indexing (`vector_cosine_ops`) for fast approximate nearest neighbor search.
- **Inference & Fallback:** Google GenAI SDK targeting `gemini-2.5-flash` with structured JSON output, backed by a deterministic database projection engine.

---

## 4. Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React 19 | Component-based single-page application |
| | TypeScript | Strict type checking across components, hooks, and API models |
| | Vite 8.3 | Development server and production bundling |
| | Axios | HTTP client with Bearer token and 401 response interceptors |
| | React Router 7 | Client-side routing with protected route boundaries |
| | Vanilla CSS | Custom properties, glassmorphism, responsive layouts, RTL support |
| **Backend** | Python 3.12 | Core backend language |
| | FastAPI | Modern, asynchronous REST API framework |
| | SQLAlchemy 2.0 | ORM and relational database modeling |
| | Pydantic v2 | Request/response schema validation and structured LLM decoding |
| | Alembic | Database migration tracking and schema versioning |
| | psycopg 3 | Asynchronous-capable PostgreSQL database adapter |
| **Database** | PostgreSQL 16 | Relational data persistence |
| | pgvector 0.5 | Native vector storage, HNSW indexing, and cosine distance |
| **AI / Retrieval** | `intfloat/multilingual-e5-small` | 384-dimensional dense multilingual embeddings |
| | Cosine Similarity | Metric used for vector distance search (`<=>`) |
| | RAG Architecture | Retrieval-Augmented Generation for grounded guidance |
| | Google GenAI SDK | Client SDK for `gemini-2.5-flash` with structured outputs |
| **Security & Auth** | bcrypt | Salted password hashing (12 rounds) |
| | PyJWT | RFC 7519 JSON Web Token signing (HMAC-SHA256) |
| **DevOps & Tooling**| Docker & Docker Compose | Containerized PostgreSQL and pgvector environment |
| | Git & GitHub | Version control in a private repository |

---

## 5. Main Application Features

### Authentication Flow
- **Registration:** Users create an account (`POST /api/auth/register`) with an email address and a secure password (minimum 8 characters). Passwords are hashed with bcrypt (12 rounds) before storage.
- **Login:** Authenticates credentials (`POST /api/auth/login`) in constant time and issues a signed JWT access token.
- **Session Management:** The access token is stored in `localStorage`. Centralized Axios interceptors attach `Authorization: Bearer <token>` to requests and automatically clear invalid tokens on 401 responses.
- **Profile:** Authenticated callers can fetch profile details via `GET /api/auth/me`.

### Problem Solving Flow
- **Submission:** Users submit a description through `POST /api/solve` with optional category hints.
- **Structured Solution Document:** Renders a clean document comprising:
  - Concise problem understanding summary.
  - Plausible underlying causes.
  - Sequenced, numbered action steps with difficulty and estimated duration badges.
  - Practical explanations and precautions.
  - A clarifying diagnostic follow-up question.
  - Linked knowledge-base source cases when retrieval confidence is met.

### Feedback and Refinement Flow
- **Satisfaction Recording:** Users indicate whether the advice resolved the issue. Users can optionally rate satisfaction from 1 to 5 stars and submit comments (`POST /api/attempts/{id}/feedback`).
- **Contextual Refinement:** When marked as unsuccessful, a refinement input appears. The user supplies additional details, and `POST /api/attempts/{id}/refine` produces a newly generated child attempt linked via `parent_attempt_id`. The original parent attempt remains immutable.

### Attempt History and Details
- **User Isolation:** Authenticated users access their own attempts through `GET /api/attempts/history`. Database-level pagination (`page`, `limit`) and sorting (`created_at DESC`) optimize performance.
- **Detailed Inspection:** Individual attempts can be opened via `GET /api/attempts/{id}` to review the full solution document, recorded feedback, and refinement lineage. Unauthorized requests return a generic 404 response to prevent identifier enumeration.

---

## 6. RAG and Safety Behavior

- **Multilingual Embeddings:** Queries and catalog passages are embedded using `intfloat/multilingual-e5-small` with asymmetric prefixes (`query: ` and `passage: `) and normalized to unit length.
- **Cosine Distance:** Candidate problems are retrieved from PostgreSQL using the pgvector cosine distance operator (`<=>`).
- **Development Confidence Threshold:** A conservative threshold of `0.82` is currently used to separate relevant matches from out-of-domain queries. This threshold is a development heuristic for the small seed dataset, not a universal constant.
- **Substantive Term Overlap:** Word tokenization (filtering English and Arabic stopwords) verifies that candidate problems share topical terms with the query before projecting solutions.
- **Language Bleed Protection:** In cross-lingual retrieval, the system responds in the user's language rather than leaking unadapted foreign text.
- **Prompt Injection Defense:** User inputs are isolated within triple quotes, reference cases are segregated in designated data blocks, and the language model is instructed to treat retrieved text strictly as passive data.
- **Structured Schema Enforcement:** Generated output is decoded into Pydantic models, preventing unexpected formatting or code injection.

---

## 7. User Interface

LifeFix features an original **Pearlescent Holographic & Liquid Glass** visual identity:

- **Luminous Foundation:** Built on a soft, warm off-white canvas (`#FDFCF8`) instead of dark or flat gray backgrounds.
- **Liquid Glass Panels:** Translucent frosted containers with `backdrop-filter: blur(16px)`, specular white highlight borders, and soft layered shadows.
- **Iridescent Ambient Refraction:** Subtle background foil elements simulate light refraction with flowing cyan, pink, lavender, and champagne caustics.
- **Harmonious Palette:**
  - `#FFD9FF` (soft magenta / pink)
  - `#C7F3F6` (luminous cyan / aqua)
  - `#FDFCF8` (pearlescent off-white)
  - `#A4C6E8` (soft periwinkle blue)
  - `#7E89CA` (lavender interactive accent)
- **Custom Vector Logo:** A stylized, flowing liquid "L" ribbon in translucent iridescent glass with chromatic caustics and a prismatic sparkle orb. It contains no robot, brain, circuit, or lightning imagery.
- **Restrained Branding:** Clean typography using Plus Jakarta Sans and Noto Sans Arabic, with visible branding standardized as "LifeFix · Personal Problem Solver".

---

## 8. Project Structure

```
LifeFix/
├── backend/
│   ├── alembic.ini                   # Alembic migration configuration
│   ├── app/
│   │   ├── api/                      # FastAPI routers (attempts, auth, deps)
│   │   ├── core/                     # Configuration and cryptographic security
│   │   ├── db/                       # SQLAlchemy engine and session management
│   │   ├── models/                   # SQLAlchemy 2.0 ORM database models
│   │   ├── schemas/                  # Pydantic v2 schemas for validation
│   │   ├── services/                 # Business logic, RAG, search, and solver services
│   │   └── main.py                   # FastAPI application entry point and CORS setup
│   ├── migrations/                   # Alembic migration versions and environment
│   │   ├── env.py
│   │   └── versions/
│   ├── requirements.txt              # Pinned Python package dependencies
│   └── scripts/                      # Idempotent database seeding scripts
│       ├── seed_development_user.py
│       ├── seed_sample_problems.py
│       └── seed_sample_solutions.py
├── frontend/
│   ├── index.html                    # Single-page application HTML entry point
│   ├── package.json                  # Frontend dependencies and scripts
│   ├── public/                       # Static public assets (favicon.svg)
│   ├── src/
│   │   ├── App.tsx                   # Top-level routing and context providers
│   │   ├── components/               # Reusable UI, layout, and solution components
│   │   │   ├── layout/               # AppLayout, Header
│   │   │   ├── solution/             # SolutionDocument, FeedbackSection, RefinementSection, StarRating
│   │   │   └── ui/                   # Button, Card, Badge, LoadingState, ErrorAlert, LifeFixLogo
│   │   ├── context/                  # AuthContext and session state
│   │   ├── index.css                 # Global CSS variables and design tokens
│   │   ├── main.tsx                  # React DOM initialization
│   │   ├── pages/                    # Route pages (HomePage, LoginPage, RegisterPage, HistoryPage, AttemptDetailsPage)
│   │   ├── services/                 # Axios API client and token storage
│   │   └── types/                    # Shared TypeScript interfaces
│   └── vite.config.ts                # Vite build and plugin configuration
├── docker-compose.yml                # PostgreSQL with pgvector container service
├── implementation.md                 # Complete technical implementation log and evaluation record
└── README.md                         # Project documentation
```

---

## 9. Local Setup

Follow these steps to run LifeFix in a local development environment.

### Prerequisites
- **Git**
- **Docker Desktop** (for running PostgreSQL and pgvector)
- **Python 3.12+**
- **Node.js 20+ and npm**

---

### Step 1: Clone Repository and Start Database
```powershell
git clone <repository-url>
cd LifeFix

# Start the PostgreSQL + pgvector container in the background
docker compose up -d
```

---

### Step 2: Configure Environment Variables
Create a `.env` file in the root `LifeFix/` directory:
```ini
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=lifefix

JWT_SECRET_KEY=your_secure_random_key_at_least_32_bytes_long!
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

---

### Step 3: Backend Setup
Open a terminal in `LifeFix/backend`:

```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment (PowerShell)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed development catalog (18 problems, 7 categories, 72 solutions)
python scripts/seed_sample_problems.py
python scripts/seed_sample_solutions.py
python scripts/seed_development_user.py

# Start the FastAPI backend server
python -m uvicorn app.main:app --reload
```
The backend API will be available at `http://localhost:8000`.

---

### Step 4: Frontend Setup
Open a second terminal in `LifeFix/frontend`:

```powershell
# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend application will be available at `http://localhost:5173` (or `http://localhost:5174`).

---

## 10. Environment Variables

All sensitive credentials and environment-specific settings are loaded from the root `.env` file (which is excluded from Git via `.gitignore`).

| Variable | Required | Description |
| :--- | :--- | :--- |
| `POSTGRES_USER` | Yes | Database username for PostgreSQL |
| `POSTGRES_PASSWORD` | Yes | Database password for PostgreSQL |
| `POSTGRES_DB` | Yes | PostgreSQL database name (e.g. `lifefix`) |
| `JWT_SECRET_KEY` | Yes | Secret key used for signing JWT access tokens (minimum 32 bytes) |
| `JWT_ALGORITHM` | No | Algorithm for JWT tokens (defaults to `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Lifespan of access tokens in minutes (defaults to `1440`) |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for structured solution generation |
| `GEMINI_MODEL` | No | Gemini model designation (defaults to `gemini-2.5-flash`) |
| `VITE_API_URL` | Optional | Frontend API target (defaults to `http://localhost:8000`) |

---

## 11. API / Backend

Interactive API documentation and schema explorers are automatically provided by FastAPI during local execution:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### Primary Endpoint Overview
- `GET /api/health/database` : Verifies PostgreSQL database connectivity.
- `POST /api/auth/register` : Creates a new user account.
- `POST /api/auth/login` : Authenticates user credentials and issues a JWT token.
- `GET /api/auth/me` : Returns the authenticated user profile.
- `GET /api/search` : Performs semantic similarity search across catalog problems.
- `GET /api/search/context` : Retrieves matching problems and associated solution steps.
- `POST /api/solve` : Solves an everyday problem via RAG and Gemini (or deterministic fallback).
- `GET /api/attempts/history` : Retrieves paginated attempt history for the authenticated user.
- `GET /api/attempts/{attempt_id}` : Returns complete details and guidance for an owned attempt.
- `POST /api/attempts/{attempt_id}/feedback` : Records user feedback, rating, and comments.
- `POST /api/attempts/{attempt_id}/refine` : Generates a refined child attempt from an unsuccessful attempt.

---

## 12. Testing & Verification

The codebase has undergone verification across database, authentication, RAG, and frontend components:

- **Vector Search Tests:** Verified pgvector cosine distance calculations, HNSW index scans, and embedding generation (`test_search.py`).
- **Authentication Suite:** Verified password hashing, registration validation, constant-time verification, and JWT creation/validation (`test_step_10_1.py`).
- **Attempt Persistence Suite:** Verified authenticated attempt linking and development guest fallback (65 passed, 0 failed in `test_step_10_2.py`).
- **History & Pagination Suite:** Verified user isolation, IDOR prevention, and pagination (63 passed, 0 failed in `test_step_11_1.py`).
- **Attempt Details Suite:** Verified authorization enforcement and safe JSON parsing (36 passed, 0 failed in `test_step_11_3.py`).
- **Refinement Lineage Suite:** Verified multi-turn refinement chains and immutability (25 passed, 0 failed in `test_step_11_4.py`).
- **Database Schema Sync:** Confirmed `alembic check` reports zero unapplied operations.
- **Frontend Code Analysis:** `npm run lint` completed with 0 errors (1 warning in AuthContext.tsx regarding React Fast Refresh).
- **Frontend Production Build:** `npm run build` completed cleanly, producing verified Vite bundles.
- **Git Formatting:** `git diff --check` confirmed clean with 0 whitespace or formatting issues.

*Note: All browser verification was performed manually across bilingual problem scenarios; automated browser testing frameworks were not run.*

---

## 13. Current Limitations

1. **Development Knowledge Base:** The catalog contains 18 seeded development problems and 72 verified solution steps.
2. **Confidence Threshold Heuristic:** The `0.82` threshold is a development heuristic calibrated for the small dataset; it should be re-evaluated as the catalog scales.
3. **Cross-Lingual Ranking:** Cross-lingual queries occasionally rank the intended opposite-language match at Position 2.
4. **Third-Party Service Dependence:** Live AI generation depends on Google Gemini API availability and network connectivity. The deterministic fallback handles outages.
5. **Scope:** Intended strictly for everyday low-risk practical problems; never for medical, legal, or hazardous situations.
6. **Deployment:** Production cloud deployment has not yet been executed.

---

## 14. Project Status

- **Implementation:** Local application implementation and feature development completed.
- **Integration:** Frontend and backend fully integrated and communicating via Axios.
- **Security:** JWT authentication and resource ownership checks operational.
- **RAG & Fallbacks:** Semantic search, confidence checks, and deterministic fallback operational.
- **Refinement & History:** Multi-turn attempt lineage and user history functional.
- **Visual Design:** Pearlescent liquid-glass redesign completed.
- **Repository:** Private repository on GitHub with main branch up to date.
- **Latest Commit:** `5b70bc1` (*"Redesign frontend with holographic glass UI"*).
- **Cloud Deployment:** Netlify frontend deployment and cloud database/backend hosting have not started yet.

---

## 15. Project Information

- **Project:** LifeFix
- **Department:** Computer Science / Artificial Intelligence
- **Institution:** Middle East University