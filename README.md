# Ramixaq AI

**Ramixaq AI: An AI-Powered Career Intelligence and Internship Readiness Platform for Students**

Build. Track. Achieve.

Ramixaq AI is a full stack MERN career intelligence platform for tracking internship readiness, skills, projects, certificates, resume progress, career goals, public portfolio data, AI resume intelligence, analytics, achievements, and admin monitoring.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT, bcrypt
- Deployment: Vercel frontend, Render backend

## Features

- User signup and login
- JWT-protected dashboard
- Internship readiness score
- Skill CRUD with level, category, priority, and target role
- Project CRUD with title, description, tech stack, GitHub link, live link, status, and featured flag
- Certificate CRUD with issuer, credential URL, issue and expiry dates
- Internship goal CRUD with progress tracking
- Roadmap suggestions based on current skills
- Resume checklist with local progress saving
- Public portfolio profile page
- AI resume analyzer with PDF upload, skill extraction, ATS score, and missing skill detection
- AI skill gap analysis against target internship roles
- AI internship recommendation engine with match percentages
- Analytics dashboard with Recharts skill, readiness, and project charts
- Public portfolio website generator with downloadable HTML
- Resume builder with downloadable PDF generation
- Achievement system with XP, badges, and level progression
- Admin dashboard for user statistics and activity monitoring
- Editable profile with Cloudinary profile photo upload
- Email verification and secure password reset by SMTP
- Public portfolios with unique `/p/:slug` URLs
- Downloadable profile and resume PDFs
- Persistent dark/light mode
- In-app notifications with unread state
- Responsive mobile navigation and theme-aware analytics
- Clean responsive dark and light UI

## Folder Structure

```txt
Ramixaq-AI/
  client/
    src/
      api/
      components/
      context/
      pages/
      utils/
    .env.example
    vercel.json
  server/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
    .env.example
  render.yaml
  package.json
  README.md
```

## Local Setup

### 1. Install dependencies

```bash
npm run install:all
```

Or install each side manually:

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Configure environment variables

Create `server/.env` from `server/.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ramixaq-ai
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
EMAIL_FROM=Ramixaq AI <no-reply@example.com>
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Create `client/.env` from `client/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the app

Terminal 1:

```bash
npm run dev:server
```

Terminal 2:

```bash
npm run dev:client
```

Frontend: `http://localhost:5173`

Backend health check: `http://localhost:5000/api/health`

## API Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification`
- `GET /api/auth/me`
- `PUT /api/auth/profile`

### Protected Resources

- `POST /api/ai/resume/analyze`
- `GET /api/ai/resume/analyses`
- `POST /api/ai/skill-gap`
- `GET /api/ai/internships`
- `GET /api/analytics`
- `GET /api/achievements`
- `GET /api/resume/download`
- `GET /api/portfolio/generate`
- `POST /api/profile/avatar`
- `GET /api/profile/export`
- `GET /api/notifications`
- `PUT /api/notifications/read-all`
- `PUT /api/notifications/:id/read`
- `GET /api/dashboard/summary`
- `GET /api/roadmap`
- `GET|POST /api/skills`
- `PUT|DELETE /api/skills/:id`
- `GET|POST /api/projects`
- `PUT|DELETE /api/projects/:id`
- `GET|POST /api/certificates`
- `PUT|DELETE /api/certificates/:id`
- `GET|POST /api/goals`
- `PUT|DELETE /api/goals/:id`

### Public

- `GET /api/public/profile/:userId`
- `GET /api/public/portfolio/:slug`

### Admin

- `GET /api/admin/summary`
- `GET /api/admin/activity`

Admin endpoints require the authenticated user document to have `role: "admin"`. Existing users default to `student`; promote an admin directly in MongoDB when deploying your first admin account.

## Deployment

### MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. Add your IP or `0.0.0.0/0` to Network Access for hosted deployments.
4. Copy the connection string into `MONGO_URI`.

### Render Backend

1. Push this project to GitHub.
2. Create a new Render Web Service, for example `ramixaq-ai-api`.
3. Set root directory to `server`.
4. Build command: `npm install`.
5. Start command: `npm start`.
6. Add environment variables:
   - `NODE_ENV=production`
   - `MONGO_URI=your MongoDB Atlas connection string`
   - `JWT_SECRET=your long random secret`
   - `CLIENT_URL=https://your-vercel-app.vercel.app`
   - SMTP variables for verification and password-reset emails
   - Cloudinary variables for persistent profile photo storage

PDF and image uploads are handled in memory. Resume PDFs are limited to 5 MB and profile images to 2 MB. Profile images are persisted in Cloudinary, so no Render disk is required.

You can also use the included `render.yaml` as a blueprint.

### Vercel Frontend

1. Import the GitHub repo into Vercel.
2. Set root directory to `client`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add environment variable:
   - `VITE_API_URL=https://your-render-api.onrender.com/api`

The included `client/vercel.json` handles SPA routing rewrites.

## Production Checklist

- Use a strong `JWT_SECRET`.
- Set Render `CLIENT_URL` to the exact Vercel URL.
- Set Vercel `VITE_API_URL` to the exact Render API URL with `/api`.
- Confirm `/api/health` returns `{ "status": "ok" }`.
- Register a test user and verify CRUD flows.
- Promote one trusted user to `role: "admin"` in MongoDB before using the admin dashboard.
- Test PDF upload with a real resume under 5 MB.
- Confirm resume PDF download and generated portfolio HTML work in production.
- Configure and test SMTP email delivery before enabling public signups.
- Configure Cloudinary and verify profile photo uploads from the deployed frontend.
- Verify the custom portfolio URL and profile PDF export for a production account.
