# Vehicle Service Backend (Express + MongoDB)

## 1. Install dependencies

```bash
cd backend
npm install
```

## 2. Configure environment

Create `.env` from `.env.example` and set your MongoDB connection:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/vehicle_service_booking
JWT_SECRET=replace_with_a_secure_long_secret
FRONTEND_URL=http://localhost:5173
```

## 3. Run backend

```bash
npm run dev
```

API base URL: `http://localhost:5000/api`

## Default seeded accounts

- Admin: `admin` / `admin123`
- Customer: `demo@vehicle.com` / `demo123`

## Main endpoints

- `POST /api/auth/admin/login`
- `POST /api/auth/customer/register`
- `POST /api/auth/customer/login`
- `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/services`
- `GET/POST/PUT/PATCH/DELETE /api/bookings`
- `GET/PUT/DELETE /api/customers` (admin only)
