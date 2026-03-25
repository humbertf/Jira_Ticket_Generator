# Jira Ticket Generator

AI-powered tool to generate well-structured Jira tickets from natural language descriptions.

## Tech Stack

- **Frontend:** React + Vite (port 5173)
- **Backend:** Node.js + Express (port 3001)
- **Language:** JavaScript (ES Modules)

## Project Structure

```
Jira_Ticket_Generator/
├── client/          # React + Vite frontend
├── server/          # Express backend
│   ├── controllers/
│   ├── middleware/
│   └── routes/
├── package.json     # Root — runs both with concurrently
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js v18+
- npm v9+

### Installation

```bash
# Install all dependencies (root + client + server)
npm run install:all
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp server/.env.example server/.env
```

| Variable | Description |
|---|---|
| `PORT` | Express server port (default: 3001) |
| `JIRA_BASE_URL` | Your Jira instance URL |
| `JIRA_EMAIL` | Jira account email |
| `JIRA_API_TOKEN` | Jira API token |
| `AI_API_KEY` | AI provider API key |

### Running in Development

```bash
# Runs frontend + backend simultaneously
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Health check: http://localhost:3001/api/health

### Running Separately

```bash
npm run dev:client   # Frontend only
npm run dev:server   # Backend only
```

### Build

```bash
npm run build   # Builds the React app to client/dist/
```
