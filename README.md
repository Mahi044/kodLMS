# LearnFlow — LMS Phase 1 MVP

A full-stack Learning Management System with YouTube-based video courses, strict sequential learning flow, and JWT authentication.

## Tech Stack

| Layer     | Technology                        |
| --------- | --------------------------------- |
| Frontend  | Next.js 14, Tailwind CSS, Zustand |
| Backend   | Node.js, Express, REST API        |
| Database  | MySQL + Prisma ORM                |
| Auth      | JWT (Access + Refresh tokens)     |

---

## Setup Instructions

### Prerequisites

- **Node.js** v18+
- **MySQL** server running
- **npm**

### 1. Clone & Configure Database

Create a MySQL database:
```sql
CREATE DATABASE lms_db;
```

### 2. Backend Setup

```bash
cd backend

# Edit .env with your MySQL credentials
# DATABASE_URL="mysql://YOUR_USER:YOUR_PASSWORD@localhost:3306/lms_db"

# Install dependencies (already done)
npm install

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with sample data
node prisma/seed.js

# Start the backend server
npm run dev
```

Backend runs on **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies (already done)
npm install

# Start the frontend dev server
npm run dev
```

Frontend runs on **http://localhost:3000**

### 4. Test Credentials

```
Email: student@test.com
Password: password123
```

---

## Features

- ✅ JWT authentication (register, login, refresh, logout)
- ✅ HTTP-only cookie refresh tokens with rotation
- ✅ YouTube video player with progress tracking
- ✅ Resume from last saved position
- ✅ Strict sequential learning flow (backend enforced)
- ✅ Auto-advance to next video on completion
- ✅ Progress tracking (debounced, every 5 seconds)
- ✅ Subject listing with search
- ✅ Dark mode
- ✅ Responsive design
- ✅ Course progress bars

---

## API Endpoints

| Method | Endpoint                  | Auth | Description                      |
| ------ | ------------------------- | ---- | -------------------------------- |
| POST   | /api/auth/register        | ❌   | Create new account               |
| POST   | /api/auth/login           | ❌   | Login & get tokens               |
| POST   | /api/auth/refresh         | 🍪   | Rotate refresh token             |
| POST   | /api/auth/logout          | 🍪   | Revoke refresh token             |
| GET    | /api/subjects             | ❌   | List all published subjects      |
| GET    | /api/subjects/:id         | ❌   | Subject details                  |
| GET    | /api/subjects/:id/tree    | ✅   | Course tree with lock status     |
| GET    | /api/videos/:id           | ✅   | Video with prev/next + lock      |
| GET    | /api/progress/videos/:id  | ✅   | Get video progress               |
| POST   | /api/progress/videos/:id  | ✅   | Update video progress            |
| GET    | /api/progress/subjects/:id| ✅   | Subject completion stats         |
