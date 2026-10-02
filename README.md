# MASAL

MASAL is a real-estate application with customer and salesperson workflows for inquiries, leads, inventory, and AI-assisted sales tasks.

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind CSS 4, React Markdown 10 | Build the customer and salesperson interfaces and render formatted assistant responses. |
| UI Components | Project-local React components | Provide reusable buttons, cards, inputs, labels, and text areas. |
| Frontend API | Browser Fetch API | Send requests from the frontend to the FastAPI backend. |
| Backend | Python, FastAPI, Pydantic, Uvicorn | Serve the API and validate request and response data. |
| Database | MongoDB Atlas-compatible URI, MongoDB, PyMongo | Store application data, with an in-memory `mongomock` fallback when no MongoDB URI is configured. |
| Authentication | Custom FastAPI authentication endpoints and role-based frontend routes | Support customer and salesperson registration and sign-in flows. |
| AI / LLM | Groq API, Groq Python SDK; sample model `llama3-70b-8192` | Analyze and prioritize leads, power global and lead-specific assistant chats, and generate marketing copy. |
| AI Image Generation | Hugging Face InferenceClient, FLUX.1-schnell, Pillow, HTML Canvas | Generate marketing images and overlay accurate property details in the browser. |

Frontend versions are the major versions declared in `frontend/package.json`; Python dependencies are listed without pinned versions in `backend/requirements.txt`.
