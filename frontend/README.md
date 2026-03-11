
# Vehicle Service Booking System

This is a code bundle for Vehicle Service Booking System. The original project is available at https://www.figma.com/design/EwNQYjFB2Ss3hyQpxolEjA/Vehicle-Service-Booking-System.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Deploy frontend on Vercel

This folder includes `vercel.json` for Vite SPA deployment.

1. Push this repo to GitHub.
2. In Vercel, import the repo.
3. Set **Root Directory** to `frontend`.
4. Add environment variable:
   - `VITE_API_URL=https://<your-render-service>.onrender.com/api`
5. Deploy.

Notes:
- If you change `VITE_API_URL`, redeploy Vercel so the new value is baked into the build.
- After frontend deploy, update backend `FRONTEND_URL` in Render to your Vercel domain.
  