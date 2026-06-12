# VertexFX Platform Setup Guide

## URLs

- Backend API: http://localhost:4000
- User Frontend: https://vertexfx.vercel.app
- Admin Dashboard: https://vertexfx-azxs.vercel.app

## Render Deployment Credentials

### Render PostgreSQL Database

- Internal Database URL: `postgresql://vertexfx_db_user:B3DBBvU07FYgYHBBrRCvZEwLbFCnVI3W@dpg-d8m3muu7r5hc739tu490-a/vertexfx_db`

## Quick Start with Docker

1. Navigate to the backend directory:
   ```powershell
   cd "c:\Users\HP Elitebook 830 G6\Downloads\broker web\vertexfx-backend"
   ```
2. Start PostgreSQL and Redis:
   ```powershell
   docker-compose up -d postgres redis
   ```
3. Wait a minute for the services to start
4. Run database migrations:
   ```powershell
   npm run prisma:migrate
   ```
5. Seed the database with test data:
   ```powershell
   npm run prisma:seed
   ```
6. Start the backend server:
   ```powershell
   npm run dev
   ```

## Database Setup Options

### Option 1: Use Neon (Serverless PostgreSQL - Recommended)

1. Sign up at https://neon.tech/
2. Create a new project (name it "vertexfx")
3. Copy the connection string provided by Neon (it will look like `postgresql://neondb_owner:npg_pEaquI0Tr3UH@ep-green-pond-apdcy1xa.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require`)
4. Update `DATABASE_URL` in `vertexfx-backend/.env` with this Neon connection string!

### Option 2: Local PostgreSQL (Without Docker)

1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer, remember the `postgres` superuser password you set!
3. Open pgAdmin 4 and create:
   - Right-click "Login/Group Roles" → Create → Login/Group Role
   - Name: `vertexfx`
   - Password: `devpassword`
   - Click "Save"
   - Right-click "Databases" → Create → Database
   - Database: `vertexfx_dev`
   - Owner: `vertexfx`
   - Click "Save"

## Redis Setup

Install Redis (Windows alternative: Memurai)

1. Download Memurai (Redis-compatible) from https://www.memurai.com/get-memurai
2. Install it, it will run on port 6379 by default

### Then proceed with setup:

- Update `DATABASE_URL` and `REDIS_URL` in `.env` if needed (they should be correct if you used the defaults above)
- Then follow steps 4-6 from the Quick Start section:
  ```powershell
  npm run prisma:migrate
  npm run prisma:seed
  npm run dev
  ```

## Admin & User Credentials

### Super Admin

- Email: admin@vertexfx.com
- Password: VertexFx@2025
- Role: Super Admin

### Compliance Officer

- Email: compliance@vertexfx.com
- Password: Compliance@2025
- Role: Compliance

### Finance Officer

- Email: finance@vertexfx.com
- Password: Finance@2025
- Role: Finance

### Demo Trader

- Email: demo@vertexfx.com
- Password: Demo@2025
- Role: Trader
