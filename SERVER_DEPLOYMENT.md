# FinTrack Pro - Server & GitHub Deployment Guide

This guide details everything you need to run, configure, and deploy **FinTrack Pro** on GitHub, GitHub Codespaces, Docker, Render, Railway, or your own VPS server.

---

## 🚀 Quick Run from GitHub

### Option 1: 1-Click GitHub Codespaces (Browser-based)
1. In your GitHub repository, click the green **`<> Code`** button.
2. Select the **Codespaces** tab and click **Create codespace on main**.
3. GitHub Codespaces will automatically install dependencies and start the application on port `3000`.
4. A browser preview popup will open directly inside your browser.

---

### Option 2: Run Locally (Node.js)
```bash
# 1. Clone repository from GitHub
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# 2. Install dependencies
npm install

# 3. Start development server (Frontend + Backend on port 3000)
npm run dev

# 4. Or build & run production server
npm run build
npm start
```
Open **`http://localhost:3000`** in your browser.

---

### Option 3: Run with Docker / Docker Compose
```bash
# Start container with persistent data volume
docker-compose up -d --build

# View server logs
docker-compose logs -f
```
The server will be running on `http://localhost:3000` with persistent storage mounted in `fintrack_data` volume.

---

### Option 4: Deploy Free Cloud Backend (Render / Railway / Fly.io)

#### Deploying on Render (Free Tier):
1. Connect your GitHub repository to [Render.com](https://render.com).
2. Click **New +** ➜ **Web Service**.
3. Set:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `NODE_ENV` = `production`
     - `PORT` = `3000`
     - `GEMINI_API_KEY` = `your_optional_gemini_key`
4. Render will deploy your full-stack application with automatic SSL (`https://your-app.onrender.com`).

---

### Option 5: Static Frontend on GitHub Pages + Cloud Backend
If you deploy your static frontend to GitHub Pages (`.github/workflows/deploy.yml` is included):
1. In GitHub Repository Settings ➜ **Pages** ➜ set source to **GitHub Actions**.
2. Push your changes to `main` branch. GitHub Actions will build and deploy the app.
3. If connecting to a remote backend, set `VITE_API_URL` to your backend URL (e.g., `https://your-backend.onrender.com`).
4. FinTrack Pro includes full offline-first storage and CORS support, so it works seamlessly on GitHub Pages even without a server!

---

## ⚙️ Environment Variables Reference

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | `3000` | Port for the HTTP/Express server |
| `NODE_ENV` | Optional | `development` | `development` or `production` |
| `GEMINI_API_KEY` | Optional | `""` | Google Gemini API key for AI Financial Advisor |
| `VITE_API_URL` | Optional | `""` | Custom backend API base URL (for decoupled hosting) |

---

## 📡 REST API & SSE Endpoints Reference

### Diagnostic & Health
- `GET /api/health` — Server health status and uptime
- `GET /api/server-info` — Real-time server storage statistics and connected clients

### Authentication & Users
- `GET /api/auth/demo-users` — Retrieve demo user accounts
- `POST /api/auth/login` — User login
- `POST /api/auth/register` — User registration with default workspace initialization
- `POST /api/auth/forgot-password` — Password reset endpoint

### Workspaces
- `GET /api/workspaces?userId=...` — List workspaces accessible to user
- `POST /api/workspaces` — Create new workspace with initial fund ledger
- `PUT /api/workspaces/:id` — Update workspace details or members
- `DELETE /api/workspaces/:id` — Delete workspace

### Transactions & Repayments
- `GET /api/workspaces/:id/transactions` — Get workspace transaction ledger
- `POST /api/workspaces/:id/transactions` — Add transaction
- `PUT /api/workspaces/:id/transactions/:txId` — Update transaction
- `DELETE /api/workspaces/:id/transactions/:txId` — Delete transaction
- `POST /api/workspaces/:id/transactions/:txId/repay` — Record debt repayment

### Recurring SIP & Expenses Engine
- `GET /api/workspaces/:id/recurring` — Get recurring rules and auto-generate due items
- `POST /api/workspaces/:id/recurring` — Create recurring rule
- `PUT /api/workspaces/:id/recurring/:ruleId` — Update recurring rule
- `DELETE /api/workspaces/:id/recurring/:ruleId` — Delete recurring rule
- `POST /api/workspaces/:id/recurring/:ruleId/trigger` — Force run a recurring rule

### Monthly Budgets
- `GET /api/workspaces/:id/budgets` — Get monthly budgets and category caps
- `POST /api/workspaces/:id/budgets` — Save or update monthly budget
- `DELETE /api/workspaces/:id/budgets/:budgetId` — Delete monthly budget

### Real-Time Synchronization (Server-Sent Events)
- `GET /api/workspaces/:workspaceId/events` — Live SSE event stream for multi-user collaboration
