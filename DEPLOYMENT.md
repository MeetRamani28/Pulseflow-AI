# Pulseflow AI: Deployment Guide & Production Checklist

This guide outlines the path to take Pulseflow AI from local Docker Compose to live production using zero-cost cloud providers.

## The Free-Tier Launch Strategy (Render)

Render is the fastest path to a live URL because it natively connects to GitHub, offers free managed Postgres/Redis, and handles Dockerfiles effortlessly.

### 1. Infrastructure (Data Layer)
*   **Postgres with pgvector:** Create a new "PostgreSQL" instance on Render. Once spun up, connect via a SQL client (like DBeaver or psql) and run `CREATE EXTENSION IF NOT EXISTS vector;` manually before deploying your apps.
*   **Redis:** Create a new "Redis" instance on Render. Save the internal connection URL.

### 2. Services (Compute Layer)
Connect your GitHub repository to Render and deploy these three separate services:

*   **AI Service (Web Service):** 
    *   Build Command: `uv pip install -r requirements.txt`
    *   Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
    *   Root Directory: `ai-services`
*   **Backend Gateway (Web Service):**
    *   Build Command: `npm install`
    *   Start Command: `npm start`
    *   Root Directory: `backend`
*   **React Frontend (Static Site):**
    *   Build Command: `npm run build`
    *   Publish Directory: `frontend/dist`
    *   Root Directory: `frontend`

## Environment Variable Mapping

In production, you do not use `.env` files. You must manually inject these keys into the Render dashboard for each specific service.

### AI Service Dashboard
*   `GROQ_API_KEY`: Your production Groq key.
*   `TAVILY_API_KEY`: Your production Tavily key.
*   `DATABASE_URL`: The internal connection string from your Render Postgres instance.
*   `LANGCHAIN_TRACING_V2`: `true`
*   `LANGCHAIN_API_KEY`: Your LangSmith key.

### Backend Dashboard
*   `DATABASE_URL`: The internal connection string from your Render Postgres instance.
*   `REDIS_URL`: The internal connection string from your Render Redis instance.
*   `AI_SERVICE_URL`: The public URL Render generates for your AI Service.
*   `FRONTEND_URL`: The public URL Render generates for your Static Site.
*   `JWT_SECRET`: A secure, 64-character random cryptographic string.

### Frontend Dashboard
*   `VITE_API_URL`: The public URL Render generates for your Backend Service + `/api`.
*   `VITE_SOCKET_URL`: The public URL Render generates for your Backend Service.

---

## AWS Free Tier Migration (Phase 2)

When you outgrow Render's free tier, migrate to AWS using the following mapping:
*   **Compute:** EC2 `t2.micro` instances running your `docker-compose.yml` natively.
*   **Database:** Amazon RDS for PostgreSQL (free tier). You must manually enable the `pgvector` extension via parameter groups.
*   **Cache:** Amazon ElastiCache for Redis (free tier).

## Pre-Flight Production Checklist

*   **Change JWT Secret:** Ensure `JWT_SECRET` is completely unique and not the default string from `.env.example`.
*   **CORS Verification:** Verify the Node.js backend's `FRONTEND_URL` exactly matches your live React domain, or your WebSocket connections will instantly fail.
*   **Rate Limits:** Monitor `express-rate-limit` logs. If BullMQ background tasks queue up too fast, you may need to adjust the limiter window.
*   **Groq Tier Limits:** Free tier Groq has strict Tokens-Per-Minute (TPM) limits. Monitor LangSmith dashboards to ensure your 70b reasoning agent isn't hitting hard limits during concurrent usage.