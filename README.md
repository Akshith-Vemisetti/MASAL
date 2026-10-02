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

Frontend versions are the major versions declared in `frontend/package.json`. Backend packages are listed in `backend/requirements.txt` without pinned versions. The example backend configuration selects `llama3-70b-8192` for Groq; set `GROQ_MODEL` to use another model available to your Groq account.

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
| `GROQ_MODEL` | AI features | The example value is `llama3-70b-8192`. |
| `HUGGINGFACE_API_KEY` | Marketing image generation | Required to generate the image; other Groq-backed marketing copy also requires `GROQ_API_KEY`. |

Start the API from the `backend` directory:

```powershell
uvicorn app.main:app --reload --port 8005
```

The API root is `http://localhost:8005/`, and interactive API documentation is available at `http://localhost:8005/docs`.

### 2. Start the frontend

In a second terminal, from the repository root:

```powershell
cd frontend
npm ci
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). The frontend uses `http://localhost:8005/api` by default; set `VITE_API_BASE_URL` in `frontend/.env` if the backend API is hosted elsewhere.

To create a production frontend build or run the linter:

```powershell
npm run build
npm run lint
```

## Demo account and security

The salesperson demo account uses [sales@masal.com](mailto:sales@masal.com). Ask the project maintainer privately for the demo password; it is not published in this README. The current backend has a hard-coded demo login, so treat its password as exposed and rotate or remove it before deployment. Do not use the current authentication implementation for production: registered passwords are stored without hashing, and the demo login is not configurable through environment variables.

Keep real API keys and database credentials in local environment files or deployment secrets; do not commit them. The checked-in `.env.example` files are templates and should contain placeholders only.

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
