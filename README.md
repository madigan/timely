# Timely Calendar Management System

## 📖 Story

A busy friend (doing the work of three people) needed help understanding where his time was going, so I wrote Timely to import his information from his different Google calendars, categorize his events, and show him where his time was going.

This repository is also an experiment in "vibe-coding" (using an AI to generate significant portions of the codebase), since it's a skill that I'm trying to learn.

## 🚀 Usage

> ⚠ This app is in a closed alpha right now, which means if you want to try the app out I need to whitelist your email. Feel free to [create an issue](https://github.com/madigan/timely/issues/new) and I'll give you access! Once that's done, you can follow the instructions below:

Go to [timely-demo.fly.dev](https://timely-demo.fly.dev) and log in with your GMail account. Then go to the [settings](https://timely-demo.fly.dev/settings) page and choose which calendars you want to import and which categories you want to use (events are categorized based on keywords in their title or description). You can also set which keywords will flag an event as "important." Then you're off to the races!

## 🏗️ Architecture

This project is structured as a monorepo with the following packages:

- **`packages/frontend/`** - Vue 3 web application with TypeScript
- **`packages/backend/`** - Bun + Elysia API server with PostgreSQL
- **`packages/shared/`** - Shared TypeScript types and utilities

## 🚀 Tech Stack

### Frontend
- **Vue 3** with TypeScript and Composition API
- **Vite** for build tooling and development server  
- **Tailwind CSS v4** + **DaisyUI** for styling
- **Pinia** for state management
- **Vue Router** for client-side routing

### Backend
- **Bun** runtime for high-performance JavaScript execution
- **Elysia** web framework for API endpoints
- **PostgreSQL** database with connection pooling
- **Google OAuth 2.0** with Google Calendar API integration
- **AES-256-CBC** token encryption for secure storage

### Database
- **PostgreSQL 15** with Docker Compose support (ephemeral for development)
- **postgres.js** driver optimized for Bun
- Automatic schema initialization and migrations with status tracking
- Connection pooling and health checks
- Migration system with parallel execution protection

## 📦 Installation

```bash
# Install all dependencies for the monorepo
bun install
```

This will install dependencies for all packages in the workspace.

## 🛠️ Development Setup

### 1. Database Setup

**Option A: Docker Compose (Recommended)**
```bash
# From the repository root
docker compose up -d
```

**Option B: External PostgreSQL**
- Install PostgreSQL 15+
- Create a database named `timely`
- Configure connection in `.env` file

### 2. Environment Configuration

Create environment files from examples:

**Backend Configuration** (`packages/backend/.env`):
```env
# Google OAuth Configuration  
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your_64_character_hex_encryption_key_here

# PostgreSQL Database
DATABASE_URL=postgresql://timely_user:timely_password@localhost:5432/timely

# Server configuration
NODE_ENV=development
PORT=3000
```

**Frontend Configuration** (`packages/frontend/.env` - optional):
```env
# API endpoint (defaults to http://localhost:3000)
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Calendar API**
4. Configure **OAuth consent screen**:
   - Add your email as a test user during development
   - Configure app information and scopes
5. Create **OAuth 2.0 credentials** (Web application):
   - Add authorized redirect URIs:
     - `http://localhost:3000/auth/google/callback` (development)
     - Your production domain callback URL
6. Copy the **Client ID** and **Client Secret** to your `.env` file
7. Generate encryption key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## 🏃 Development

### Start Development Servers

**Full Stack Development:**
```bash
# Start both frontend and backend concurrently
bun dev
```

This runs:
- Frontend development server on `http://localhost:5173` (Vite with hot reload)
- Backend development server on `http://localhost:3000` (Elysia with auto-reload)

**Individual Services:**
```bash
# Frontend only
cd packages/frontend && bun run dev

# Backend only
cd packages/backend && bun run dev
```

### Development URLs
- **Frontend**: http://localhost:5173 (development)
- **Backend API**: http://localhost:3000/api/*
- **Production**: http://localhost:3000 (serves both frontend and API)

## 🏗️ Build & Production

### Build for Production
```bash
# Build frontend and copy to backend static directory
bun run build
```

### Start Production Server
```bash
# Serve built app and API from single server
bun start
```

This serves the built Vue app and API endpoints on `http://localhost:3000`.

## 🗄️ Database Schema

### Tables

**users** - Stores user account information and encrypted OAuth tokens:
- `id` (PRIMARY KEY, TEXT)
- `access_token` (TEXT, encrypted with AES-256-CBC)
- `refresh_token` (TEXT, optional, encrypted with AES-256-CBC)
- `expiry_date` (BIGINT, timestamp)
- `email` (TEXT, user email)
- `name` (TEXT, user display name)
- `picture` (TEXT, user profile picture URL)
- `created_at` (TIMESTAMP, default CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, default CURRENT_TIMESTAMP)

**sessions** - Manages user sessions:
- `session_id` (PRIMARY KEY, TEXT)
- `user_id` (TEXT, foreign key to users.id)
- `created_at` (TIMESTAMP, default CURRENT_TIMESTAMP)
- `expires_at` (TIMESTAMP, default CURRENT_TIMESTAMP + 30 days)

**categories** - User-defined event categories:
- `id` (PRIMARY KEY, TEXT, default gen_random_uuid())
- `user_id` (TEXT, foreign key to users.id, ON DELETE CASCADE)
- `name` (TEXT, category name)
- `color` (TEXT, hex color code, must match ^#[0-9A-Fa-f]{6}$)
- `keywords` (TEXT[], array of keywords for auto-categorization)
- `target` (INTEGER, percentage target 0-100)
- `created_at` (TIMESTAMP, default CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, default CURRENT_TIMESTAMP)

**important_event_settings** - User-specific important event keywords and preferences:
- `id` (PRIMARY KEY, TEXT, default gen_random_uuid())
- `user_id` (TEXT, foreign key to users.id, ON DELETE CASCADE)
- `keywords` (TEXT[], array of keywords for important event detection)
- `enabled` (BOOLEAN, default true)
- `display_limit` (INTEGER, 1-20, default 3)
- `created_at` (TIMESTAMP, default CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, default CURRENT_TIMESTAMP)

**migrations** - Tracks database migrations:
- `name` (PRIMARY KEY, TEXT) - Migration filename
- `status` (TEXT) - `IN_PROGRESS` or `COMPLETED`
- `created_at` (TIMESTAMP, default CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, default CURRENT_TIMESTAMP)

### Database Management

**Migration Commands:**
```bash
# Run pending migrations
cd packages/backend && bun run migrate:run

# Check migration status
cd packages/backend && bun run migrate:status
```

**Database Commands:**
```bash
# Check database status
docker compose ps

# Connect to database
docker exec timely-postgres psql -U timely_user -d timely

# View tables
docker exec timely-postgres psql -U timely_user -d timely -c "\\dt"

# Reset database (ephemeral - data will be lost)
docker compose down && docker compose up -d

# Stop database
docker compose down
```

**Note:** The development database is configured without persistent volumes, so data is reset each time the container restarts. This makes it easy to test migrations from a clean state.

## 🔌 API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - OAuth callback handler
- `POST /auth/logout` - Logout and clear session
- `GET /auth/profile` - Get authenticated user profile

### Calendar Data
- `GET /api/calendars` - Get user's Google calendars
- `GET /api/calendars/:id/events` - Get events for specific calendar
- `GET /api/calendars/events` - Get events from all enabled calendars

### Categories
- `GET /api/categories` - Get user's categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update existing category
- `DELETE /api/categories/:id` - Delete category

### Important Events
- `GET /api/important-events/settings` - Get user's important event settings
- `PUT /api/important-events/settings` - Update user's important event settings

### Health Check
- `GET /api/health` - Health check endpoint

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:
1. Check the [GitHub Issues](https://github.com/your-username/timely/issues)
2. Review this README for configuration help
3. Check the Docker Compose logs: `docker compose logs`
4. Verify Google OAuth setup in Google Cloud Console
