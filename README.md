# Vehicle Service Booking System

Full-stack vehicle service booking application with a React frontend and an Express + MongoDB backend.

## Live URLs

- Frontend: https://frontend-one-eosin-67.vercel.app
- Backend: https://backend-bice-gamma-15.vercel.app
- Health check: https://backend-bice-gamma-15.vercel.app/api/health

## Features

- Customer registration and login
- Admin login and dashboard access
- Service category management
- Vehicle service booking management
- Customer management for admins
- Seeded default admin, customer, and service data

## Tech Stack

- Frontend: React, Vite, MUI, Radix UI
- Backend: Node.js, Express, MongoDB, Mongoose
- Authentication: JWT
- Deployment: Vercel

## Project Structure

```text
backend/   Express API, MongoDB models, seed data
frontend/  React + Vite client application
render.yaml  Legacy Render deployment config
```

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/Sathsarani2002/vehicle_management_system.git
cd vehicle_management_system
```

### 2. Start the backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at:

```text
http://localhost:5000/api
```

Backend environment variables:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/vehicle_service_booking
JWT_SECRET=replace_with_a_secure_long_secret
FRONTEND_URL=http://localhost:5173
```

### 3. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

For local frontend development, set:

```env
VITE_API_URL=http://localhost:5000/api
```

## Default Accounts

- Admin: `admin` / `admin123`
- Demo customer: `demo@vehicle.com` / `demo123`

## Main API Endpoints

- `POST /api/auth/admin/login`
- `POST /api/auth/customer/register`
- `POST /api/auth/customer/login`
- `GET /api/auth/me`
- `GET /api/health`
- `GET/POST/PUT/DELETE /api/services`
- `GET/POST/PUT/PATCH/DELETE /api/bookings`
- `GET/PUT/DELETE /api/customers`

## Deployment Notes

### Frontend on Vercel

- Root directory: `frontend`
- Required environment variable: `VITE_API_URL=https://backend-bice-gamma-15.vercel.app/api`

### Backend on Vercel

- Root directory: `backend`
- Required environment variables:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `FRONTEND_URL=https://frontend-one-eosin-67.vercel.app`

The backend uses a serverless entrypoint at `backend/api/index.js` for Vercel deployment.

## Notes

- The backend local `.env` can point to a local MongoDB instance for development.
- Production uses MongoDB Atlas through Vercel environment variables.
- `render.yaml` is kept in the repo, but the current live deployment is on Vercel.