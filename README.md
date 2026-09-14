# QuizMaster - Full-Stack Quiz Management Website

**QuizMaster** is a full-stack web application designed for creating, managing, and taking timed quizzes with automated scoring, admin management, and a dynamic public leaderboard.

---

## 📁 Project Folder Structure

```
QuizMaster/
├── backend/                  # Node.js & Express API Backend
│   ├── config/
│   │   └── db.js             # MySQL connection pool configuration
│   ├── models/
│   │   └── schema.sql        # Database table schemas (users, admins, quizzes, questions, attempts)
│   ├── routes/
│   │   └── api.js            # Health check & status routes
│   ├── .env                  # Active environment variables
│   ├── .env.example          # Environment variables template
│   ├── package.json          # Backend dependencies & scripts
│   └── server.js             # Express server entry point
│
├── frontend/                 # React.js Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/       # UI components (for future phases)
│   │   ├── pages/            # Page layouts & views (for future phases)
│   │   ├── App.jsx           # Main Dashboard & System Diagnostic UI
│   │   ├── index.css         # Modern Glassmorphic CSS Design System
│   │   └── main.jsx          # React DOM entry point
│   ├── index.html            # HTML template with Google Fonts
│   ├── package.json          # Frontend dependencies & scripts
│   └── vite.config.js        # Vite dev server & proxy settings
│
└── README.md                 # Project Documentation & Setup Guide
```

---

## 🛠️ Created Files Summary

| Directory | File | Purpose |
| :--- | :--- | :--- |
| `backend/` | `package.json` | Node dependencies (`express`, `mysql2`, `cors`, `dotenv`, `jsonwebtoken`, `bcryptjs`) |
| `backend/` | `server.js` | Express app listener & router middleware |
| `backend/` | `config/db.js` | MySQL pool setup & connection verifier |
| `backend/` | `models/schema.sql` | SQL DDL table schemas with optimized leaderboard indexes |
| `backend/` | `routes/api.js` | Health check (`/api/health`) & DB status (`/api/db-status`) APIs |
| `backend/` | `.env` & `.env.example` | Database & JWT environment parameters |
| `frontend/` | `package.json` | React 18, Vite 5, Lucide React icons |
| `frontend/` | `vite.config.js` | Dev server (Port 3000) & API proxy config (Port 5000) |
| `frontend/` | `src/App.jsx` | System status dashboard & application roadmap |
| `frontend/` | `src/index.css` | Glassmorphic theme system, custom utility classes & responsive layout |
| `frontend/` | `src/main.jsx` | React root mounting script |
| `frontend/` | `index.html` | Base HTML document with Outfit & Inter Google fonts |

---

## 🚀 Setup & Execution Instructions

### Prerequisites
- **Node.js** (v16+ recommended)
- **npm** (comes with Node.js)
- **MySQL Server** (Local MySQL, XAMPP, or Docker MySQL)

---

### Step 1: Install Dependencies

#### 1. Backend Dependencies
Open terminal in the project root directory and run:
```bash
cd backend
npm install
```

#### 2. Frontend Dependencies
In another terminal (or navigate back to project root) run:
```bash
cd frontend
npm install
```

---

### Step 2: Database Setup (MySQL)

1. Open your MySQL client (Command line, MySQL Workbench, or phpMyAdmin).
2. Run the SQL script located in `backend/models/schema.sql` to create the `quizmaster_db` database and required tables:
```sql
SOURCE backend/models/schema.sql;
```
3. Update the `.env` file in `backend/.env` with your MySQL credentials:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=quizmaster_db
DB_PORT=3306
JWT_SECRET=quizmaster_super_secret_jwt_key_2026
```

---

### Step 3: Start the Backend Server

Inside the `backend` folder, run:
```bash
npm run dev
```
- Server will run at: `http://localhost:5000`
- API Health Check: `http://localhost:5000/api/health`
- Database Status Check: `http://localhost:5000/api/db-status`

---

### Step 4: Start the Frontend Application

Inside the `frontend` folder, run:
```bash
npm run dev
```
- Open browser at: `http://localhost:3000`

---

## ⚡ Verification Checklist

- [x] Separate `frontend/` and `backend/` folders created.
- [x] Node.js/Express server created with `/api/health` check.
- [x] MySQL connection module (`backend/config/db.js`) and database DDL (`schema.sql`) configured.
- [x] React frontend (Vite) set up with modern glassmorphism CSS UI.
- [x] Frontend successfully communicates with Backend via Vite proxy.
