# Timely Calendar Management System - Technical Reference

> **Note**: This file serves as the comprehensive technical reference for AI agents and developers working on the Timely codebase. For user-facing documentation, see [README.md](./README.md).

## 📖 Project Overview

**Timely** is a Vue 3 web application that helps users import their Google Calendar, categorize events, and visualize time spent in each category. It's designed for organizations (particularly churches) to track and analyze their event time allocation.

This repository is also an experiment in "vibe-coding" (using an AI to generate significant portions of the codebase).

## 🏗️ Architecture

This project is structured as a monorepo with three main packages:

- **[Backend Package](./packages/backend/AGENTS.md)** - Bun + Elysia API server with PostgreSQL
- **[Frontend Package](./packages/frontend/AGENTS.md)** - Vue 3 SPA with TypeScript and Tailwind CSS
- **[Shared Package](./packages/shared/AGENTS.md)** - Common TypeScript types and utilities

## 🚀 Tech Stack

### Core Technologies
- **Frontend**: Vue 3 with TypeScript and Composition API
- **Backend**: Bun with Elysia web framework
- **Build Tool**: Vite (frontend)
- **Styling**: Tailwind CSS v4 + DaisyUI components
- **State Management**: Pinia stores
- **Routing**: Vue Router v4
- **Package Manager**: Bun
- **Authentication**: Google OAuth 2.0 with Google Calendar API integration
- **Database**: PostgreSQL with Bun SQL

### Key Dependencies

#### Frontend
```json
{
  "vue": "^3.5.18",
  "pinia": "^3.0.3",
  "vue-router": "^4.5.1",
  "tailwindcss": "^4.1.11",
  "daisyui": "^5.0.50",
  "vue3-google-login": "^2.0.34"
}
```

#### Backend
```json
{
  "elysia": "^1.1.30",
  "@elysiajs/cors": "^1.1.1",
  "@elysiajs/static": "^1.1.1",
  "@elysiajs/cookie": "^0.8.0",
  "google-auth-library": "^10.3.0",
  "googleapis": "^158.0.0",
  "cookie": "^1.0.2"
}
```

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
- `created_at`, `updated_at` (TIMESTAMP)

**sessions** - User session management with expiration:
- `session_id` (PRIMARY KEY, TEXT)
- `user_id` (TEXT, foreign key to users.id)
- `created_at` (TIMESTAMP)
- `expires_at` (TIMESTAMP, default CURRENT_TIMESTAMP + 30 days)

**categories** - User-defined event categories with keywords and targets:
- `id` (PRIMARY KEY, TEXT, default gen_random_uuid())
- `user_id` (TEXT, foreign key to users.id, ON DELETE CASCADE)
- `name` (TEXT, category name)
- `color` (TEXT, hex color code)
- `keywords` (TEXT[], array of keywords for auto-categorization)
- `target` (INTEGER, percentage target 0-100)
- `created_at`, `updated_at` (TIMESTAMP)

**important_event_settings** - User-specific important event keywords and preferences:
- `id` (PRIMARY KEY, TEXT, default gen_random_uuid())
- `user_id` (TEXT, foreign key to users.id, ON DELETE CASCADE)
- `keywords` (TEXT[], array of keywords for important event detection)
- `enabled` (BOOLEAN, default true)
- `display_limit` (INTEGER, 1-20, default 3)
- `created_at`, `updated_at` (TIMESTAMP)

**migrations** - Database migration tracking:
- `name` (PRIMARY KEY, TEXT) - Migration filename
- `status` (TEXT) - `IN_PROGRESS` or `COMPLETED`
- `created_at`, `updated_at` (TIMESTAMP)

### Key Relationships
- Categories belong to users (user_id foreign key)
- Sessions belong to users (user_id foreign key)
- Important event settings belong to users (user_id foreign key)
- All tables include created_at and updated_at timestamps

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

## 🎯 Core Features & Functionality

### 1. Authentication System
Complete Google OAuth 2.0 integration with secure session management and token encryption.
- See [Backend Package](./packages/backend/AGENTS.md#1-authentication-system) for implementation details
- See [Frontend Package](./packages/frontend/AGENTS.md#1-authentication-system) for client-side integration

#### Authentication Architecture

The application uses a complete server-side OAuth 2.0 flow:

1. **OAuth Initiation**: User clicks "Log In" → redirects to `/auth/google`
2. **Google Consent**: Server redirects to Google OAuth consent screen
3. **Authorization Code**: Google redirects back with authorization code
4. **Token Exchange**: Server exchanges code for access/refresh tokens
5. **User Profile**: Server fetches user profile from Google
6. **Session Creation**: Server creates secure session and sets HTTP-only cookie
7. **Token Storage**: Access/refresh tokens encrypted and stored securely
8. **Frontend State**: Frontend auth store updated with user information

#### Security Features
- **CSRF Protection**: State parameter prevents cross-site request forgery
- **Token Encryption**: AES-256-CBC encryption for stored OAuth tokens
- **HTTP-Only Cookies**: Session cookies not accessible to JavaScript
- **Secure Sessions**: In-memory session management with unique session IDs
- **Token Refresh**: Automatic token refresh handling for expired access tokens

### 2. Calendar Management
Real-time Google Calendar integration with multiple calendar support and event filtering.
- See [Backend Package](./packages/backend/AGENTS.md#2-calendar-management) for API implementation
- See [Frontend Package](./packages/frontend/AGENTS.md#2-calendar-management) for UI components

### 3. Event Categorization
Keyword-based automatic event classification with customizable categories and time tracking.
- Pre-configured categories for church/ministry use:
  - Worship Services (40% target)
  - Fellowship (25% target)
  - Community Outreach (20% target)
  - Education & Study (10% target)
  - Music & Arts (5% target)
- Color-coded visualization
- CRUD operations for custom categories
- See [Backend Package](./packages/backend/AGENTS.md#3-category-management) for data layer
- See [Frontend Package](./packages/frontend/AGENTS.md#3-event-categorization) for user interface

### 4. Analytics & Reporting
Comprehensive time allocation analysis with monthly and weekly statistics.
- See [Frontend Package](./packages/frontend/AGENTS.md#4-analytics--reporting) for visualization components

### 5. Important Events Tracking
Configurable event importance detection and highlighting.
- See [Frontend Package](./packages/frontend/AGENTS.md#5-important-events-tracking) for implementation

### 6. Calendar Visualization
Responsive calendar grid with print optimization for organizational planning.
- See [Frontend Package](./packages/frontend/AGENTS.md#4-calendar-management) for display components

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

All shared data models and TypeScript interfaces are defined in the [Shared Package](./packages/shared/AGENTS.md#key-data-models), including:

- User and authentication interfaces
- Calendar and event data structures
- Category definitions
- API response types
- Configuration interfaces

See the [Shared Package documentation](./packages/shared/AGENTS.md) for complete type definitions.

## 💻 Development Commands

### Root Level Commands
```bash
# Install all dependencies (frontend + backend + shared)
bun install

# Start both frontend and backend concurrently
bun run dev

# Build both frontend and backend
bun run build

# Start production server
bun run start

# Run frontend tests
bun run test

# Run TypeScript type checking
bun run type-check

# Code formatting and linting
bun run lint
bun run lint:fix
bun run format
bun run format:write
bun run check
bun run check:fix
```

### Package-Specific Commands
- **[Frontend Commands](./packages/frontend/AGENTS.md#development-commands)**: Vue development server, building, and testing
- **[Backend Commands](./packages/backend/AGENTS.md#development-commands)**: API server, database migrations, and deployment

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

## 🔐 Security Features

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

### Key Patterns
- **Composition API**: All Vue components use `<script setup>` syntax
- **Pinia Stores**: Reactive state management with composable pattern
- **TypeScript**: Full type safety with interfaces for all data models
- **CSS Framework**: Utility-first with Tailwind + DaisyUI components
- **Responsive Design**: Mobile-first approach with print optimization
- **ElysiaJS**: Modern web framework with built-in cookie handling and type safety

### Testing Setup
- **Framework**: Vitest for unit testing
- **DOM Testing**: jsdom for component testing
- **Vue Testing**: @vue/test-utils integration

## 🚨 Current Issues & Known Problems

### Critical Issues
1. **Security**: Exposed OAuth credentials in committed `.env` file

### TypeScript Configuration Issues
- Backend `tsconfig.json` doesn't include all source files
- Missing type declarations for some modules
- Import resolution issues

## 🤖 Agent Instructions

### General Guidelines
When working with this codebase:

1. **Package-specific instructions** - Refer to each package's AGENTS.md for detailed development guidelines:
   - [Frontend Package](./packages/frontend/AGENTS.md#agent-instructions)
   - [Backend Package](./packages/backend/AGENTS.md#agent-instructions)
   - [Shared Package](./packages/shared/AGENTS.md#agent-instructions)

2. **TypeScript consistency** - Use types from the shared package across all components
3. **Package manager** - Use `bun` for all dependency and script operations
4. **Environment variables** - Document configuration in package-specific AGENTS.md files
5. **Development workflow** - Follow the monorepo structure for cross-package development
6. **Dev Server** - Ask the human to run the development server if it is not already running on port 3000. The dev server automatically restarts when changes are made.

### Development Workflow

#### Getting Started
1. **Clone the repository**
2. **Install dependencies**: `bun install`
3. **Set up environment variables** (see package-specific configuration)
4. **Set up database** and run migrations
5. **Start development servers**: `bun dev`

#### Package-Specific Workflows
- **[Frontend Development](./packages/frontend/AGENTS.md#development-workflow)**: Component development and testing
- **[Backend Development](./packages/backend/AGENTS.md#development-workflow)**: API development and database management
- **[Shared Development](./packages/shared/AGENTS.md#development-workflow)**: Type and utility development

#### Code Quality
- **Type checking**: Run package-specific type checking commands
- **Testing**: Execute tests in each package as needed
- **Database**: Check migration status before deployment

#### Deployment
- **Build**: `bun run build` (builds both frontend and backend)
- **Deploy**: Use Fly.io deployment configuration in `fly.toml`
- **Database**: Ensure production database is set up with all migrations applied

## 📝 Current State

### Production-Ready Features
- **Complete Authentication**: Google OAuth 2.0 integration with secure token storage
- **Real Google Calendar Data**: Fetches actual calendar events from authenticated users' Google accounts
- **Secure Session Management**: HTTP-only cookies with encrypted token storage
- **Categories**: Pre-configured for church/ministry use cases with automatic event categorization
- **Recent Fixes Applied**: Database column mapping corrected, categories primary key conflicts resolved, duplicate default categories removed

The codebase architecture is solid and has been updated with recent fixes to database column mapping, categories primary key conflicts, and duplicate default categories. The Vue 3 frontend with Pinia stores and the Elysia backend with PostgreSQL provide a robust foundation for the calendar management application. Note that security concerns regarding exposed OAuth credentials should be addressed before production deployment.

---

Read @AGENTS.md