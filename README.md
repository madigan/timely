# Timely Calendar Management System

A busy friend (doing the work of three people) needed help understanding where his time was going, so I wrote Timely to import his information from his different Google calendars, categorize his events, and show him where his time was going.

## 🚀 Usage

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

# PostgreSQL Database (choose one approach)
# Option 1: Single connection string (recommended)
DATABASE_URL=postgresql://timely_user:timely_password@localhost:5432/timely

# Option 2: Individual parameters
# POSTGRES_HOST=localhost
# POSTGRES_PORT=5432
# POSTGRES_DB=timely
# POSTGRES_USER=timely_user
# POSTGRES_PASSWORD=timely_password

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

## 📁 Project Structure

```
timely/
├── packages/
│   ├── frontend/                 # Vue 3 Application
│   │   ├── src/
│   │   │   ├── components/       # Vue components
│   │   │   │   ├── skeletons/    # Loading skeleton components
│   │   │   │   ├── CalendarGrid.vue      # Main calendar display
│   │   │   │   ├── CalendarMonth.vue     # Individual month component
│   │   │   │   ├── CategoryModal.vue     # Category management modal
│   │   │   │   ├── CategorySettings.vue  # Category settings interface
│   │   │   │   ├── Header.vue            # Navigation with auth
│   │   │   │   ├── ImportantEventsPanel.vue # Important events display
│   │   │   │   ├── ImportantEventsSettings.vue # Important events config
│   │   │   │   ├── MonthAnalyticsModal.vue # Monthly analytics modal
│   │   │   │   ├── MonthlyStatsPanel.vue # Monthly statistics
│   │   │   │   ├── WeeklyStatsPanel.vue  # Weekly statistics
│   │   │   │   └── ...
│   │   │   ├── stores/          # Pinia state management
│   │   │   │   ├── auth.ts              # Authentication state
│   │   │   │   ├── calendars.ts         # Calendar data & events
│   │   │   │   ├── categories.ts        # Event categorization
│   │   │   │   ├── importantEvents.ts   # Important events state
│   │   │   │   └── toast.ts             # Toast notifications
│   │   │   ├── views/           # Page components
│   │   │   │   ├── CalendarView.vue     # Main calendar view
│   │   │   │   ├── SettingsView.vue     # Configuration page
│   │   │   │   └── SplashView.vue       # Landing page
│   │   │   ├── utils/           # Utility functions
│   │   │   │   └── events.ts            # Event utility functions
│   │   │   ├── lib/             # Library code
│   │   │   │   ├── __tests__/           # Test files
│   │   │   │   └── eventAnalytics.ts    # Analytics utilities
│   │   │   ├── router/          # Vue Router config
│   │   │   └── constants/        # Application constants
│   │   ├── index.html           # HTML template
│   │   └── vite.config.ts       # Vite configuration
│   ├── backend/                  # Bun + Elysia API
│   │   ├── src/
│   │   │   ├── services/        # Service modules
│   │   │   │   ├── auth/        # Authentication services
│   │   │   │   │   ├── auth.middleware.ts   # Auth middleware
│   │   │   │   │   ├── auth.routes.ts       # Auth routes
│   │   │   │   │   ├── auth.service.ts      # Auth business logic
│   │   │   │   │   └── tokens.service.ts    # Token management
│   │   │   │   ├── calendar/    # Calendar services
│   │   │   │   │   ├── calendar.routes.ts   # Calendar routes
│   │   │   │   │   └── calendar.service.ts  # Calendar API logic
│   │   │   │   ├── categories/  # Category services
│   │   │   │   │   ├── categories.routes.ts # Category routes
│   │   │   │   │   └── categories.service.ts # Category business logic
│   │   │   │   ├── importantEvents/ # Important events services
│   │   │   │   │   ├── importantEvents.routes.ts # Important events routes
│   │   │   │   │   └── importantEvents.service.ts # Important events logic
│   │   │   │   ├── db/          # Database layer
│   │   │   │   │   └── database.service.ts  # PostgreSQL connection
│   │   │   │   └── health/      # Health check service
│   │   │   │       └── health.routes.ts     # Health check routes
│   │   │   ├── scripts/         # CLI utilities
│   │   │   │   ├── migrate.ts           # Migration runner
│   │   │   │   └── migrate-status.ts    # Migration status checker
│   │   │   ├── env.ts           # Environment configuration
│   │   │   ├── index.ts         # Server entry point
│   │   │   └── server.ts        # Server setup
│   │   ├── migrations/          # Database migration files
│   │   │   ├── 202508271438.ts              # Initial schema
│   │   │   └── 202509011459-important-events-settings.ts # Important events
│   │   └── package.json
│   └── shared/                   # Shared TypeScript types
│       ├── src/
│       │   ├── types/           # Type definitions
│       │   │   └── index.ts     # Main types export
│       │   ├── utils/           # Utility functions
│       │   │   └── index.ts     # Main utils export
│       │   └── index.ts         # Main package export
│       └── package.json
├── docker-compose.yml            # PostgreSQL development database
├── Dockerfile                    # Production container
├── fly.toml                      # Fly.io deployment config
├── package.json                  # Root workspace config
└── biome.json                    # Code formatting config
```

## 🎯 Core Features

### 1. **Google Calendar Integration**
- Full Google OAuth 2.0 authentication flow
- Real-time calendar data synchronization
- Multiple calendar support with enable/disable toggles
- Automatic token refresh handling

### 2. **Event Categorization**
- Keyword-based automatic event classification
- Pre-configured categories for church/ministry use:
  - Worship Services (40% target)
  - Fellowship (25% target)
  - Community Outreach (20% target)
  - Education & Study (10% target)
  - Music & Arts (5% target)
- Color-coded visualization
- CRUD operations for custom categories

### 3. **Calendar Visualization**
- Monthly grid view with event display
- Date range filtering
- Print-optimized layouts
- Responsive design for mobile devices
- Important events highlighting

### 4. **Settings & Configuration**
- Calendar visibility toggles
- Category management interface
- Important events keyword configuration
- User profile management

## 🔐 Security Features

### Authentication
- **Server-side OAuth 2.0**: Complete Google OAuth implementation
- **CSRF Protection**: State-based protection against cross-site request forgery
- **HTTP-only Cookies**: Session cookies not accessible to JavaScript
- **Token Encryption**: AES-256-CBC encryption for stored access/refresh tokens
- **Automatic Token Refresh**: Handles expired tokens transparently

### Database Security
- **Connection Pooling**: Secure connection management
- **Parameterized Queries**: SQL injection protection
- **Encrypted Storage**: All sensitive tokens encrypted at rest
- **Session Expiration**: Automatic cleanup of expired sessions

## 🧪 Testing

```bash
# Run frontend unit tests
bun run test

# Run TypeScript type checking
bun run type-check

# Frontend tests only
cd packages/frontend && bun run test:unit

# Type check specific package
cd packages/frontend && bun run type-check
```

## 🚀 Deployment

### Fly.io Deployment (Recommended)

The application is configured for deployment on **Fly.io**:

```bash
# Deploy to Fly.io
fly deploy

# Check deployment status
fly status

# View logs
fly logs
```

### Docker Deployment

```bash
# Build production image
docker build -t timely .

# Run container
docker run -p 3000:3000 timely
```

### Environment Variables for Production

Ensure these are set in your production environment:
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret  
- `ENCRYPTION_KEY` - 32-byte hex encryption key
- `NODE_ENV=production`

## 📊 Data Models

### Core Interfaces

```typescript
interface Calendar {
  id: string;
  summary: string;
  primary?: boolean;
  backgroundColor?: string;
  isEnabled: boolean;
  events?: CalendarEvent[];
}

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  keywords: string[];
  target: number; // percentage (0-100)
}

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}
```

## 🛠️ Development Guidelines

### Code Style
- **Vue 3 Composition API**: Use `<script setup>` syntax exclusively
- **TypeScript**: Full type safety with proper interfaces
- **Tailwind CSS**: Utility-first styling with DaisyUI components
- **Pinia Stores**: Reactive state management with composable pattern
- **RESTful APIs**: Follow REST conventions for all endpoints

### File Naming
- **Components**: PascalCase (e.g., `CalendarGrid.vue`)
- **Stores**: camelCase (e.g., `auth.ts`, `calendars.ts`)
- **Utilities**: camelCase (e.g., `events.ts`)
- **Routes**: kebab-case (e.g., `/api/calendar-events`)

### Best Practices
1. **Responsive Design**: Mobile-first approach
2. **Print Optimization**: Calendar views optimized for printing
3. **Error Handling**: Comprehensive error handling and user feedback
4. **Performance**: Lazy loading and efficient state management
5. **Accessibility**: ARIA labels and semantic HTML
6. **Security**: Always validate and sanitize user inputs

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following the development guidelines
4. **Run tests**: `bun test && bun type-check`
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:
1. Check the [GitHub Issues](https://github.com/your-username/timely/issues)
2. Review this README for configuration help
3. Check the Docker Compose logs: `docker compose logs`
4. Verify Google OAuth setup in Google Cloud Console

---

**Built with ❤️ for church and ministry calendar management**