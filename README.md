# 🏰 CLANDESTINE — "Ideas Find a Home"

> **A modern social blogging platform disguised as an ancient, explorable dark-fantasy castle observatory.**

---

## 🧭 Design Philosophy

CLANDESTINE rejects flat SaaS templates and generic blogging cards. Instead, **the 3D dark-fantasy castle environment itself IS the interface**:

- **Castle Rooms = Category Halls** (Astronomy, Cathedral & Architecture, Science & Alchemy, Great Library, Literature & Writing, Historic Crypts, and dynamically created categories).
- **Lecterns = Published Posts & Articles** (Real posts stored in PostgreSQL and rendered on 3D pedestals).
- **Writing Desk = Create / Edit Post** (Post editor with word count, reading time calculation, tag management, and dynamic category creation).
- **Book Reader = Post View & Comments** (Full-text reader with threaded comments, reply hierarchy, likes, bookmarks, and moderation).
- **Profile Modal = User Profiles** (Avatar monograms, published posts, like counts, and saved bookmarks).
- **Search Modal = Dynamic Full-Text Search** (Real-time search across titles, contents, tags, and authors).
- **First-Person Exploration** (WASD movement, mouse-look, jumping, footsteps, candle lighting, floating particles, and cursor trail).

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, Three.js (WebGL 3D engine), Tailwind CSS, Lucide Icons, Vite.
- **Backend**: Node.js, Express 5, JSON Web Tokens (JWT), bcrypt.js.
- **Database**: PostgreSQL (via `pg.Pool`) with automated, zero-config in-memory fallback for local dev & testing without database prerequisites.
- **Testing**: Vitest, Supertest (19 unit & integration tests covering auth, CRUD, ownership authorization, moderation, and canary routing).
- **Linting**: ESLint 9+ with flat config (0 errors, 0 warnings quality gate across `server/` and `src/`).
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`) running lint, migration, test, build, and pushing images to GitHub Container Registry (GHCR).
- **Containerization**: Multi-stage `Dockerfile` and `docker-compose.yml` orchestrating PostgreSQL and the Clandestine app serving static frontend and API on port 5000.

---

## ⚡ Quickstart

### 1. Prerequisites
- Node.js 18+ or 20+
- npm 9+
- *(Optional)* Docker & Docker Compose or local PostgreSQL 16+

### 2. Installation
```bash
git clone <repository-url>
cd Clandestine3.0
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default `.env` configuration:
```env
PORT=5000
DATABASE_URL=postgres://clandestine:secret_arcane_pass@localhost:5432/clandestine_db
JWT_SECRET=clandestine-arcane-secret-jwt-key-2026
FRONTEND_URL=http://localhost:5173
CANARY_COMMENT_PERCENT=15
```

> **Note**: If PostgreSQL is not currently running on your machine, Clandestine automatically activates its built-in in-memory fallback store matching the exact SQL interface. Everything works immediately out of the box!

### 4. Database Migration & Demonstration Seed
```bash
# Run migrations (creates tables: users, categories, posts, comments, likes, bookmarks)
npm run migrate

# Seed demonstration accounts, categories, and published articles
npm run seed
```

### 5. Running the Application
Open two terminal windows (or run in background):

**Terminal 1 — Backend API (Port 5000):**
```bash
npm run server
```

**Terminal 2 — Frontend Dev Server (Port 5173):**
```bash
npm run dev
```

Visit **`http://localhost:5173`** in your browser to enter the castle!

---

## 🔑 Demonstration User Accounts

Pre-seeded with real demonstration articles and comments:

| User Name | Role | Email | Password |
|---|---|---|---|
| **Person A** | Author / Admin | `persona@clandestine.internal` | `password123` |
| **Person B** | Author | `personb@clandestine.internal` | `password123` |

*(Tip: In the "Sign In" modal, 1-click demo login buttons are provided for instant testing!)*

---

## 🧪 Testing & Verification

### Unit & Integration Test Suite (`vitest` + `supertest`)
Runs 19 automated tests verifying:
- Comment Moderation Service (prohibited word detection, word boundaries, leetspeak evasion, script injection prevention, and scam link filtering)
- User registration, login, and JWT issuance
- Post creation, retrieval, and filtering
- **Backend Authorization Enforcement**: Prevents unauthorized users from editing or deleting other users' posts (returns HTTP 403 Forbidden)
- Comment submission, threading, and deletion authorization
- Canary release header routing (`x-canary-channel: v2`)

```bash
npm run test
```

### Code Style & Linting (`eslint`)
```bash
npm run lint
```

### Production Build
```bash
npm run build
```

---

## 🐳 Docker & Containerization

### Run Complete Stack with PostgreSQL:
```bash
docker-compose up --build
```
This boots:
1. `db`: PostgreSQL 16 Alpine with persistent volume and healthchecks.
2. `app`: Clandestine production server with automated migrations, seed, and static client serving.

Access at **`http://localhost:5000`**.

---

## 🌿 Phase 1: Trunk-Based Development Evidence

Phase 1 trunk-based development with short-lived feature branch and pull-request review merge commit targeting the **Comment Service moderation logic**:

View the git graph anytime with:
```bash
git log --graph --oneline --all
```

**Git Evidence Log Output:**
```
*   3736312 Merge pull request #1 from feature/comment-moderation-enhancement
|\  
| * d887a1c feat(moderation): enhance comment moderation with word boundaries, regex, and spam link detection
|/  
* 0a5e30e feat: initial Clandestine castle engine with persistence, auth, and baseline moderation
```

---

## 🐦 Phase 2: Canary Release for Threaded Comments

The comment delivery pipeline features a lightweight Canary rollout mechanism (`server/services/canaryService.js`):

1. **Percentage Bucketing**: Configured via `CANARY_COMMENT_PERCENT` (e.g. 15%). Users are deterministically hashed into Canary buckets.
2. **Explicit Override**: Send the header `x-canary-channel: v2` or query parameter `?canary=true` to force Canary mode.
3. **Payload Difference**:
   - `v1-standard`: Flat comment list.
   - `v2-canary`: Hierarchically nested comment tree with thread depth, reply routing, and metadata badges.

---

## 🎮 3D World Controls

- **WASD / Arrow Keys**: Walk across stone halls and corridors
- **Mouse**: Look around 360 degrees
- **Left Click on Canvas**: Lock pointer for mouse-look
- **Spacebar**: Jump
- **Shift**: Sprint
- **E**: Open and read post on nearby lectern
- **M**: Toggle Castle Directory & Fast Travel teleportation
- **Esc**: Close open reader / Return to first-person exploration
