# MASAL AI — AI-Powered Real Estate Sales Assistant

MASAL helps real-estate salespeople turn inbound customer inquiries into actionable sales opportunities. The platform supports lead intake, AI lead analysis, prioritization, conversational sales assistance, property inventory management, and AI-generated marketing content for sales workflows.

## Live Demo

**Frontend:** [MASAL AI login](https://masal-one.vercel.app/login)

**Backend API:** [FastAPI service](https://masal-bud4.onrender.com)

## Demo Credentials

### Salesperson

- Email: sales@masal.com
- Password: masal2024

The login page includes a "Continue as Salesperson" button that fills these demo values into the form while still using the normal authentication flow. This is not a bypass of authentication.

### Customer

Customer accounts are created through the registration flow in the app.

## Problem Statement

Real-estate sales teams often receive many inbound customer inquiries with different budgets, preferred locations, timelines, financing requirements, property types, and concerns. Manually reading each lead, deciding who needs immediate attention, and drafting the next message can be slow and inconsistent.

MASAL uses AI to organize incoming demand, highlight the right sales priorities, and help the salesperson respond more quickly and confidently.

## Solution

```text
Customer inquiry
        ↓
Structured lead data
        ↓
AI analysis
        ↓
Priority scoring
        ↓
Salesperson dashboard
        ↓
Conversational AI assistance
        ↓
Recommended sales action
```

The application collects each inquiry in a structured format, analyzes it with the Groq LLM, and stores AI-generated summary, intent, concerns, and recommended next steps alongside the lead. Salespeople can then review leads by priority, inspect details, and ask follow-up questions through the assistant.

## Key Features

### Customer features

- Registration and login
- Property inquiry submission
- Inquiry history
- Structured property requirements capture

### Salesperson features

- Salesperson authentication
- Lead management
- Search and filtering
- Sorting by AI priority score
- Lead expansion and details
- AI lead analysis
- Priority classification and score
- Recommended next action
- Suggested customer response
- Global AI Sales Assistant
- Lead-specific AI Assistant
- Property inventory management
- Property details
- AI marketing post generation
- Marketing image generation
- Caption and hashtag generation

## User Roles

### Customer

Customers can register and log in, then submit inquiries describing the property they want. Their inquiries are displayed in a customer dashboard and can be reviewed over time.

### Salesperson

Salespeople can review all leads, prioritize them, launch AI analysis, chat with assistant modes, and manage inventory and marketing assets.

## Lead Data Collected

Each lead stores the following fields in the current implementation:

- Name
- Location
- Property requirement
- Property type
- BHK / size
- Budget
- Buying timeline
- Purpose
- Financing
- Customer message
- Additional structured metadata such as customer ID and created timestamp

The Location field represents the desired property location or area where the customer wants to buy, not the customer's current residence.

## AI Lead Analysis

The backend AI service analyzes the complete lead record and produces these fields:

- Summary
- Intent
- Key requirements
- Concerns
- Recommended next action
- Suggested response
- Priority
- Priority score
- Priority reason

The analysis is based on the full lead context rather than a single field. It looks at the combined effect of location, budget, timeline, purpose, financing, and customer message.

## AI Prioritization

The AI prioritization model generates:

- Priority: High / Medium / Low
- Priority score: 0–100
- Priority reason

The current scoring is designed to reflect sales-readiness and urgency rather than rewarding only a larger budget. It evaluates:

- Buying Timeline / Urgency
- Purchase Intent
- Requirement Clarity
- Budget Clarity
- Financing Readiness
- Purpose Clarity
- Customer Message / Engagement

Priority ranges used in the app are:

- High: 70–100
- Medium: 40–69
- Low: 0–39

## Global AI Sales Assistant

The Global Assistant is not limited to one selected lead. It can answer salesperson questions across the lead records available to the backend and is designed to operate as a working sales copilot.

Example prompts include:

- "Find a lead with Vivek"
- "Show me the top 2 leads"
- "Show me all high-priority leads"
- "How many leads need follow-up?"
- "Compare Rahul and Vivek"
- "Which leads are looking for properties in Bengaluru?"
- "Which of them are using loans?"
- "What is Rahul's budget?"
- "Which lead should I contact next?"

### Architecture

```text
User Query
    ↓
Conversation History / Reference Resolution
    ↓
Query Planner
    ↓
Structured Retrieval Plan
    ↓
Fresh MongoDB Retrieval
    ↓
Relevant Lead Context
    ↓
Groq LLM
    ↓
Natural Language Response
    ↓
Markdown Renderer
    ↓
Salesperson
```

Important implementation detail: every Global Chat turn performs fresh retrieval against the current query. Previous retrieval limits do not carry forward automatically. For example, a previous request for "top 2 leads" does not restrict a later query such as "Compare Rahul and Priya". The later question triggers a fresh retrieval search and resolves the named leads independently.

## Global Chat + Context Window Strategy

The Global Assistant maintains conversational continuity without blindly sending every lead to the LLM on every request. Conversation history is used to resolve references such as "him", "them", or "the second lead". The current query is then translated into a structured retrieval plan and the backend fetches only the relevant lead records from MongoDB. Only the context needed for the current question is passed to the LLM.

This helps the system:

- avoid unnecessary context
- reduce token usage
- reduce context-window pressure
- improve response relevance
- keep retrieval deterministic
- prevent earlier query limits from contaminating future queries
- allow cross-dataset questions over the lead records available to the backend

Conversation history provides conversational context. Database retrieval provides factual lead context. Those two concepts are intentionally separate.

## Query Planning

The Query Planner is responsible for translating natural-language requests into a structured retrieval plan instead of answering directly. In the current implementation, it extracts values such as:

- intent
- locations
- priority filters
- target lead names
- requested numeric limits
- conversational references

Guidance implemented in the backend is strict:

- Numeric limits are applied only when the user explicitly asks for them.
- "Top 2 leads" => limit = 2
- "Top 5 leads" => limit = 5
- "Show all high-priority leads" => no arbitrary limit
- "Compare Rahul and Priya" => retrieve the explicitly named leads without inheriting a previous limit

## Entity / Name Resolution

The Global Assistant supports:

- case-insensitive matching
- partial-name matching
- full-name matching
- conversational references

Example:

- User asks: "Find Rahul"
- Database contains: "Rahul Sharma"
- The assistant can resolve the partial name to the correct lead record.

Name matching uses a case-insensitive regular-expression search over the lead records. If a partial name could match multiple records, review the results and clarify the intended person rather than assuming that a single match is guaranteed.

## Lead-Specific AI Assistant

The salesperson can open an AI assistant scoped to a single selected lead. In this mode, the selected lead becomes the conversation boundary.

```text
Selected Lead ID
    ↓
Complete Lead Context
    ↓
Conversation History
    ↓
Current User Query
    ↓
Groq LLM
    ↓
Lead-specific Response
```

Examples of supported topics in lead-scoped chat:

- budget
- location
- property requirement
- BHK / size
- buying timeline
- purpose
- financing
- customer message
- concerns
- priority
- priority reason
- recommended next action
- suggested response
- call preparation
- follow-up messaging

Lead-specific chat is intentionally scoped to that lead and must not leak information from another lead. For example, while inside Rahul Sharma's lead chat, questions such as "Compare Rahul with Arjun" or "What about Priya?" are not allowed to pull in another lead's context in that lead-scoped conversation.

## AI Marketing Post Generation

The salesperson can select a property from inventory and generate marketing content. The backend uses the Groq model to create:

- marketing caption
- hashtags
- image prompt

Then Hugging Face Inference with FLUX is used to generate the visual marketing image. The property details are overlaid programmatically in the browser to keep factual details accurate rather than depending on the image model to render text inside the image.

Current UI actions include:

- copy caption
- copy hashtags
- regenerate
- download image

## Technical Architecture

```text
Frontend
React + TypeScript + Vite
        │
        │ REST API
        ↓
FastAPI Backend
        │
        ├── Authentication
        ├── Lead Management
        ├── AI Analysis
        ├── Query Planning
        ├── Global Chat
        ├── Lead Chat
        └── Inventory
        │
        ├──────────────→ MongoDB Atlas or mongomock
        │
        └──────────────→ Groq API
                              │
                              ↓
                            LLM
```

For marketing images:

```text
FastAPI
   ↓
Groq
   ↓
Marketing content + image prompt
   ↓
Hugging Face FLUX
   ↓
Generated property marketing visual
```

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn-inspired local component system
- React Router
- React Markdown

### Backend

- Python
- FastAPI
- Pydantic
- PyMongo
- Uvicorn

### AI

- Groq API / Groq Python SDK
- Hugging Face Inference
- FLUX image generation

### Database

- MongoDB Atlas
- mongomock for local fallback when no MongoDB URI is configured

### Deployment

- Vercel
- Render

## Project Structure

```text
MASAL/
├── README.md
├── .gitignore
├── backend/
│   ├── .env.example
│   ├── requirements.txt
│   ├── uploads/
│   └── app/
│       ├── config.py
│       ├── database.py
│       ├── main.py
│       ├── routes/
│       │   ├── auth.py
│       │   ├── chat.py
│       │   ├── inventory.py
│       │   └── leads.py
│       ├── schemas/
│       │   ├── ai_analysis.py
│       │   ├── inventory.py
│       │   ├── lead.py
│       │   └── user.py
│       └── services/
│           └── ai_service.py
└── frontend/
    ├── package.json
    ├── package-lock.json
    ├── vercel.json
    ├── vite.config.ts
    ├── public/
    └── src/
        ├── App.tsx
        ├── components/
        ├── context/
        ├── layouts/
        ├── lib/
        ├── pages/
        ├── services/
        └── main.tsx
```

## Application Flow

1. A customer registers or logs in.
2. The customer submits a property inquiry with desired location, requirement, budget, and timeline.
3. The backend stores the lead in MongoDB.
4. The salesperson reviews leads in the dashboard and uses search, filters, and AI priority scores.
5. An individual lead can be analyzed with AI to generate a summary, concerns, and recommended action.
6. The salesperson can ask global or lead-scoped questions through the AI assistants.
7. Inventory can be added and managed for marketing workflows.
8. A property can be processed into a marketing caption, hashtags, and custom AI-generated image.

## API / Backend Overview

The FastAPI backend exposes routes under `/api` for:

- authentication (`/api/auth`)
- leads (`/api/leads`)
- AI chat (`/api/chat`)
- inventory (`/api/inventory`)

Key backend behavior:

- MongoDB connection is initialized at startup.
- If `MONGODB_URI` is absent, the app uses `mongomock` for local fallback.
- `/health` returns service health status.
- `/uploads` serves uploaded property images from the configured upload directory.
- AI analysis and chat calls require Groq credentials to be configured.

## Database

MASAL uses MongoDB for persistent lead, user, and inventory data. The current implementation stores structured customer requirements and AI-generated lead analysis results as part of the lead document where available.

The app also supports a local fallback using `mongomock` when no `MONGODB_URI` is configured. Secret values such as connection strings and API keys are not included in the repository.

## Local Development Setup

### Backend

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Then configure the variables in `backend/.env` and start the API:

```powershell
uvicorn app.main:app --reload --port 8005
```

The backend serves:

- `http://localhost:8005/`
- `http://localhost:8005/health`
- `http://localhost:8005/docs`

### Frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend is typically served at `http://localhost:5173` and uses `http://localhost:8005/api` by default. If the backend is hosted elsewhere, update `VITE_API_BASE_URL` in `frontend/.env`.

## Environment Variables

### Backend

```env
MONGODB_URI=
DATABASE_NAME=masal
GROQ_API_KEY=
GROQ_MODEL=llama-3.1-70b-versatile
HUGGINGFACE_API_KEY=
FRONTEND_URL=http://localhost:5173
SALES_DEMO_EMAIL=
SALES_DEMO_PASSWORD=
UPLOAD_DIR=uploads
```

These values must be supplied through local environment configuration or deployment environment variables. Do not commit real secrets to the repository.

### Frontend

```env
VITE_API_BASE_URL=http://localhost:8005/api
```

## Deployment

The project is deployed as two separate services:

### Frontend

- Platform: Vercel
- Production URL: https://masal-one.vercel.app/login

### Backend

- Platform: Render
- Production URL: https://masal-bud4.onrender.com

The deployment relationship is:

```text
GitHub main branch
       ↓
Vercel → frontend deployment

GitHub main branch
       ↓
Render → FastAPI deployment
```

Environment variables are configured separately for each deployment. The production frontend should point to the deployed backend API, not to a local development `VITE_API_BASE_URL` value.

## Security Considerations

- Secrets are supplied through environment variables, not hard-coded into the app.
- API keys and database credentials should never be committed to Git.
- Customer and lead data are treated as untrusted input when passed to the LLM.
- Retrieved database content must not be interpreted as system instructions.
- Lead-specific conversations remain scoped to the selected lead.
- Prompt injection attempts should not expose system prompts, developer instructions, credentials, or internal implementation details.

**Production limitation:** frontend route guards are client-side, and the current API does not consistently authenticate the caller or enforce customer/lead ownership before returning records. Do not use this deployment with real customer data until server-side authentication and authorization are implemented. The safeguards described above are design requirements and prompt protections, not a guarantee that sensitive information cannot be exposed.

## AI Usage Disclosure

AI development tools, including ChatGPT and GitHub Copilot/Antigravity, were used during planning, implementation, debugging, and documentation. The application itself uses the Groq API for lead analysis, lead prioritization, conversational assistance, and marketing content generation, and Hugging Face Inference with FLUX for property marketing image generation. AI-assisted code and generated outputs were reviewed and integrated as part of development.

## Future Improvements

The following are realistic future enhancements and are not currently presented as implemented features:

- CRM integrations
- richer analytics and sales dashboards
- automated follow-up reminders
- lead activity timelines
- property recommendation matching
- calendar integration
- WhatsApp and email integrations
- stronger production authentication
- role-based access control
- observability and monitoring

## Author / Project Information

Project: MASAL AI

Purpose: AI-powered real-estate sales support for customer inquiries, lead prioritization, and inventory marketing.

Repository: This project contains the current frontend and backend implementation for the MASAL application.

## Final Note

MASAL is designed as a practical AI-assisted sales workflow for real-estate teams: collect customer demand, analyze intent, prioritize outreach, provide conversational assistance, and generate marketing content for property inventory. The current implementation is a working application that reflects the repository as it exists today, rather than a hypothetical or future-state product.
