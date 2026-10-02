# MASAL

MASAL is a real-estate lead and inventory management application. Customers can submit property inquiries and review their submissions; salespeople can manage property listings, review incoming leads, and use AI-assisted analysis and marketing tools.

## Product workflows

### For customers

- Create an account and sign in.
- Submit a property inquiry with location, budget, property requirements, timeline, and other preferences.
- Review previously submitted inquiries.

### For salespeople

- Review leads and filter them by search terms and AI-assigned priority.
- Analyze an individual lead or run analysis for pending leads.
- Chat with the global sales assistant or ask questions about a specific lead.
- Create, edit, browse, and remove property inventory.
- Generate marketing copy and an AI-generated property image, then download the image with property details overlaid.

## Technology stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind CSS 4, React Markdown 10 | Build the role-based web application and render formatted assistant responses. |
| UI components | Project-local React components | Provide reusable interface elements such as buttons, cards, inputs, labels, and text areas. |
| Frontend API | Browser Fetch API | Send application requests to the backend. |
| Backend | Python 3.11, FastAPI, Pydantic, Uvicorn | Serve API endpoints and validate application data. |
| Database | MongoDB, MongoDB Atlas, PyMongo, mongomock | Persist users, leads, and inventory, with an in-memory fallback when no MongoDB URI is configured. |
| Authentication | Custom FastAPI endpoints and frontend role-based routes | Route customer and salesperson accounts to their respective application areas. |
| AI / LLM | Groq API and Groq Python SDK | Analyze and prioritize leads, power assistant chats, and generate marketing copy using the configured Groq model. |
| AI image generation | Hugging Face InferenceClient and FLUX.1-schnell | Generate property marketing images from AI-written prompts. |
| Image composition | Pillow and browser HTML Canvas | Encode generated images and overlay accurate property information for downloads. |

Frontend versions are the major versions declared in `frontend/package.json`. Backend packages are listed in `backend/requirements.txt` without pinned versions. The backend defaults to the Groq model `llama-3.1-70b-versatile`; set `GROQ_MODEL` to another model available to your Groq account.

## Getting started

### Prerequisites

- Python 3.11
- Node.js and npm
- A Groq API key for AI lead analysis, assistant chat, and marketing copy
- A Hugging Face access token for AI-generated marketing images
- A MongoDB connection string for persistent data (optional for local exploration; the backend uses an in-memory `mongomock` database if it is omitted)

### 1. Configure the backend

From the repository root, create and activate a virtual environment, install the backend dependencies, and copy the example environment file:

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and set the service credentials and database connection you want to use:

| Variable | Required for | Notes |
|---|---|---|
| `MONGODB_URI` | Persistent storage | Leave empty to use the temporary in-memory database. |
| `DATABASE_NAME` | MongoDB storage | Defaults to `masal`. |
| `FRONTEND_URL` | Browser access | Defaults to `http://localhost:5173`. |
| `GROQ_API_KEY` | AI features | Required for lead analysis, assistants, and marketing copy. |
| `GROQ_MODEL` | AI features | Defaults to `llama-3.1-70b-versatile`. |
| `HUGGINGFACE_API_KEY` | Marketing image generation | Required to generate the image; other Groq-backed marketing copy also requires `GROQ_API_KEY`. |
| `SALES_DEMO_EMAIL` / `SALES_DEMO_PASSWORD` | Optional salesperson demo login | Both must be set to enable the demo account; keep the password private. |
| `UPLOAD_DIR` | Uploaded property images | Defaults to the local `uploads` directory. |

Start the API from the `backend` directory:

```powershell
uvicorn app.main:app --reload --port 8005
```

The API root is `http://localhost:8005/`; health and interactive API documentation are available at `http://localhost:8005/health` and `http://localhost:8005/docs`.

### 2. Start the frontend

In a second terminal, from the repository root:

```powershell
cd frontend
npm ci
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). The frontend uses `http://localhost:8005/api` by default; set `VITE_API_BASE_URL` in `frontend/.env` if the backend API is hosted elsewhere. This URL must include the `/api` prefix.

To create a production frontend build or run the linter:

```powershell
npm run build
npm run lint
```

## Deployment

Deploy the frontend and backend as separate services. The repository contains Vercel SPA rewrites in `frontend/vercel.json`; no production service URLs or credentials are committed.

### Frontend — Vercel

Create a Vercel project for this repository and configure:

| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Framework Preset | Vite |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js Version | `20.19+` or `22.12+` |

Set `VITE_API_BASE_URL` in the Vercel project’s Production environment to `https://YOUR-RENDER-DOMAIN/api`. Vite embeds `VITE_*` values in browser assets, so this variable must contain only the public API base URL, never a secret. Rebuild/redeploy after changing it.

### Backend — Render

Create a Render web service from this repository and configure:

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Runtime | Python |
| Python Version | `3.11.9` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Health Check Path | `/health` |

Configure backend variables in the Render service’s Environment settings; copy the names and safe placeholders from `backend/.env.example`. Set `MONGODB_URI`, `GROQ_API_KEY`, and `HUGGINGFACE_API_KEY` to the actual private values in Render’s dashboard. Set `FRONTEND_URL` to `https://YOUR-VERCEL-DOMAIN` (or a comma-separated list of exact allowed frontend origins), and set `DATABASE_NAME` if you want a database name other than `masal`. Set both `SALES_DEMO_EMAIL` and `SALES_DEMO_PASSWORD` only if you need the optional demo salesperson login. Render provides `PORT`; do not hard-code it.

`FRONTEND_URL` is an allow-list, not an authentication mechanism. Local development origins remain enabled by the backend. Do not use a wildcard origin for production.

Property uploads are stored on the backend filesystem. Render’s ordinary filesystem is ephemeral, so attach a persistent disk mounted at `/var/data` and set `UPLOAD_DIR=/var/data/uploads` if uploaded images must survive restarts and deploys. Without persistent storage, uploaded files can be lost.

### Database and AI providers

- **MongoDB Atlas:** Create a database user with only the required database permissions, select the `masal` database (or configure `DATABASE_NAME`), and set `MONGODB_URI` as a private Render variable. Allow the Render service’s outbound IP addresses in Atlas Network Access; do not expose the database to all IPs as a shortcut. The backend checks connectivity during startup and returns database-unavailable responses if it cannot connect.
- **Groq:** Store the API key only as `GROQ_API_KEY` in Render. The model is selected with `GROQ_MODEL`; the backend uses a 30-second request timeout.
- **Hugging Face:** Store the access token only as `HUGGINGFACE_API_KEY` in Render. The InferenceClient uses a 60-second timeout for FLUX.1-schnell image generation.

### Security and remaining production work

The backend now hashes newly registered passwords and moves legacy plaintext passwords to PBKDF2 hashes after a successful login. The former hard-coded salesperson demo password was present in earlier public source history; removing it from current code does not erase it from GitHub history. Treat it as exposed and rotate/revoke it before enabling any demo account.

**Do not use this deployment with real customer data yet.** Frontend role checks are client-side only, and the API routes do not enforce authenticated identity or ownership for customer/lead data. Add server-side authentication and authorization before public production use. A successful `/health` response verifies process liveness only; it does not promise that MongoDB or AI providers are available.

## Local deployment checks

From the repository root:

```powershell
cd frontend
npm ci
npm run build
npm run lint
cd ..\backend
python -m pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8005
```

Then open `http://localhost:8005/health` and verify it returns `{"status":"ok"}`. To exercise persistent storage and AI features locally, configure the backend variables in `backend/.env`; do not commit that file.

## Demo account and security

The optional salesperson demo account uses [sales@masal.com](mailto:sales@masal.com); configure its email and password privately using `SALES_DEMO_EMAIL` and `SALES_DEMO_PASSWORD`. Leave both variables empty to disable this login. The former hard-coded demo password is present in earlier public Git history; treat it as exposed and rotate it. The current backend hashes registered passwords, and upgrades legacy plaintext password records after a successful login.

Keep real API keys and database credentials in local environment files or deployment secrets; do not commit them. The checked-in `.env.example` files contain blank secret values and safe configuration placeholders only.

## Repository layout

```text
backend/
  app/
    routes/       FastAPI authentication, lead, inventory, and chat endpoints
    schemas/      Pydantic request and response models
    services/     Groq analysis, assistant, and marketing generation
  requirements.txt
frontend/
  src/
    components/   Shared UI and salesperson assistant components
    context/      Client-side authentication state
    pages/        Customer and salesperson screens
    services/     API request helpers
  package.json
```
