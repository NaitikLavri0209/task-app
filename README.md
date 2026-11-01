# TaskFlow – Task Management App (ITUE301, Practicals 3–13)

Stack: React (Vite) · Node/Express · MongoDB (Mongoose) · JWT · node-cache · EventEmitter · Docker · GitHub Actions · Gemini API

## Run locally
```bash
# 1. MongoDB must be running locally (or use Docker below)
cd server && cp .env.example .env     # set JWT_SECRET (+ GEMINI_API_KEY for Prac 13)
npm install && npm run dev            # http://localhost:5000
cd ../client && npm install && npm run dev   # http://localhost:5173
```
## Run with Docker (Prac 11)
```bash
cp .env.example .env     # set JWT_SECRET, GEMINI_API_KEY
docker compose up --build   # app at http://localhost:8080
```
## Practical → file map
| Prac | What | Where |
|---|---|---|
| 3 | GitHub API + spinner/error | `portfolio-additions/` (copy into your portfolio) |
| 4 | Express REST API, logging, global error handler | `server/src/app.js`, `middleware/logger.js`, `middleware/errorHandler.js`, `utils/AppError.js` |
| 5 | MongoDB + Mongoose CRUD | `server/src/models/`, `routes/tasks.js` |
| 6 | React UI ↔ API, loading/error states | `client/src/pages/Tasks.jsx`, `api.js`, `components/` |
| 7 | bcrypt, JWT, protected routes, validation | `routes/auth.js`, `middleware/auth.js`, `validate.js`, `client/.../ProtectedRoute.jsx` |
| 8 | React.lazy + Suspense | `client/src/App.jsx` (see separate chunks in `npm run build`) |
| 9 | node-cache + comparison | `middleware/cache.js`, `scripts/benchmark.js` (`npm run benchmark`) |
| 10 | EventEmitter notifications | `events/notifier.js`, `routes/notifications.js`, `NotificationBell.jsx` |
| 11 | Dockerfiles + Compose | `server/Dockerfile`, `client/Dockerfile`, `docker-compose.yml` |
| 12 | GitHub Actions + tests | `.github/workflows/ci.yml`, `server/tests/api.test.js` (`npm test`) |
| 13 | AI task breakdown | `services/ai.js`, `routes/ai.js`, `client/src/pages/Assistant.jsx` |

## API
`POST /api/auth/register|login` · `GET/POST /api/tasks` · `GET/PUT/DELETE /api/tasks/:id` · `GET /api/tasks?status=todo` · `GET /api/notifications` · `POST /api/ai/suggest` · `GET /api/health`
