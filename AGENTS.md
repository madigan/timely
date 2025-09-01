# AGENTS.md - Timely Calendar Application

## Project Overview
**Timely** is a Vue 3 web application that helps users import their Google Calendar, categorize events, and visualize time spent in each category. It's designed for organizations (particularly churches) to track and analyze their event time allocation.

## Tech Stack & Architecture

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

## Project Structure

### Monorepo Architecture
```
packages/
├── frontend/         # Vue.js frontend application
│   └── src/
│       ├── assets/           # CSS and static assets
│       │   ├── base.css              # Base styles
│       │   ├── logo.svg              # App logo
│       │   ├── main.css              # Main stylesheet
│       ├── components/       # Vue components
│       │   ├── CalendarGrid.vue        # Main calendar display
│       │   ├── CalendarMonth.vue       # Monthly calendar view
│       │   ├── CategoryModal.vue       # Category management UI
│       │   ├── CategorySettings.vue    # Category settings panel
│       │   ├── FeaturesSection.vue     # Landing page features
│       │   ├── Footer.vue             # App footer
│       │   ├── Header.vue             # App header with nav
│       │   ├── HeroSection.vue        # Landing page hero
│       │   ├── ImportantEventsPanel.vue    # Important events display
│       │   ├── ImportantEventsSettings.vue # Important events config
│       │   ├── MonthAnalyticsModal.vue     # Monthly analytics modal
│       │   ├── MonthlyStatsPanel.vue       # Monthly statistics
│       │   ├── WeeklyStatsPanel.vue        # Weekly statistics
│       ├── constants/        # Application constants
│       │   └── display.ts             # Display-related constants
│       ├── lib/              # Library code
│       │   ├── __tests__/             # Unit tests
│       │   │   └── eventAnalytics.test.ts
│       │   └── eventAnalytics.ts      # Event analytics utilities
│       ├── router/           # Vue Router configuration
│       │   └── index.ts               # Router setup
│       ├── stores/           # Pinia state management
│       │   ├── auth.ts                # User authentication
│       │   ├── calendars.ts           # Calendar data & events
│       │   ├── categories.ts          # Event categorization
│       │   └── importantEvents.ts     # Important events filtering
│       ├── utils/            # Utility functions
│       │   └── events.ts              # Event processing utilities
│       ├── views/            # Page components
│       │   ├── HomeView.vue           # Main dashboard/landing
│       │   └── SettingsView.vue       # App configuration
│       ├── App.vue           # Root component
│       └── main.ts           # Application entry point
├── backend/          # Elysia/Bun backend API
│   └── src/
│       ├── auth/             # Authentication modules
│       │   ├── oauth.ts              # Google OAuth configuration
│       │   └── tokens.ts             # Token management & sessions
│       ├── db/               # Database configuration
│       │   └── database.ts            # Database setup & migrations
│       ├── routes/           # API route handlers
│       │   ├── auth.ts               # Authentication endpoints
│       │   ├── calendar.ts           # Calendar API endpoints
│       │   └── categories.ts         # Categories API endpoints
│       ├── scripts/          # Database scripts
│       │   ├── migrate-status.ts     # Migration status checker
│       │   └── migrate.ts            # Migration runner
│       ├── services/         # Business logic services
│       │   ├── categories/           # Category services
│       │   │   └── categories.service.ts
│       │   └── calendar.ts           # Google Calendar API integration
│       └── index.ts          # Server entry point
└── shared/           # Shared types and utilities
    └── src/
        ├── types/            # Shared TypeScript types
        │   └── index.ts
        ├── utils/            # Shared utility functions
        │   └── index.ts
        └── index.ts
```

## Core Features & Functionality

### 1. Authentication System
- **Frontend**: `packages/frontend/src/stores/auth.ts` - Pinia store for user state
- **Backend**: `packages/backend/src/routes/auth.ts` - OAuth endpoints and session management
- **OAuth Configuration**: `packages/backend/src/auth/oauth.ts` - Google OAuth 2.0 setup
- **Token Management**: `packages/backend/src/auth/tokens.ts` - Secure token storage and sessions

#### Implementation Details
- **Google OAuth 2.0 Flow**: Complete server-side OAuth implementation
- **Session Management**: HTTP-only cookies with secure session storage
- **Token Encryption**: AES-256-CBC encryption for stored access/refresh tokens
- **CSRF Protection**: State-based protection against cross-site request forgery
- **Google Calendar API**: Full integration with Google Calendar v3 API
- **User Profile**: Retrieves and stores user profile information from Google

### 2. Calendar Management
- **Frontend**: `packages/frontend/src/stores/calendars.ts` - Calendar state management
- **Backend**: `packages/backend/src/services/calendar.ts` - Google Calendar API integration
- **API Routes**: `packages/backend/src/routes/calendar.ts` - Calendar endpoints

#### Features
- **Real Google Calendar Data**: Fetches actual calendar data from user's Google account
- **Multiple Calendar Support**: Handles multiple Google calendars with enable/disable toggles
- **Event Filtering**: Date range filtering and calendar-specific event retrieval
- **Authenticated Requests**: Secure API calls using stored OAuth tokens

### 3. Event Categorization
- **Frontend**: `packages/frontend/src/stores/categories.ts` - Category state management
- **Backend**: `packages/backend/src/services/categories/categories.service.ts` - Category business logic
- **API Routes**: `packages/backend/src/routes/categories.ts` - Category CRUD endpoints
- Keyword-based automatic event classification
- Color-coded categories with target time percentages
- CRUD operations for category management
- Pre-configured categories: Worship, Fellowship, Outreach, Education, Music

### 4. Calendar Visualization
- **Location**: `packages/frontend/src/components/CalendarGrid.vue`
- Monthly grid view with event display
- Date range filtering
- Print-optimized layout
- Responsive design with mobile support

### 5. Important Events Tracking
- **Location**: `packages/frontend/src/stores/importantEvents.ts`, `packages/frontend/src/utils/events.ts`
- Keyword-based importance detection
- Event filtering and sorting utilities
- Configurable importance criteria

### 6. Analytics & Reporting
- **Monthly Statistics**: `packages/frontend/src/components/MonthlyStatsPanel.vue`
- **Weekly Statistics**: `packages/frontend/src/components/WeeklyStatsPanel.vue`
- **Event Analytics**: `packages/frontend/src/lib/eventAnalytics.ts`
- Category-based time allocation analysis
- Print-optimized reports for organizational planning

## Database Schema

### Tables
- **users**: User account information and encrypted OAuth tokens
- **sessions**: User session management with expiration
- **categories**: User-defined event categories with keywords and targets
- **migrations**: Database migration tracking

### Key Relationships
- Categories belong to users (user_id foreign key)
- Sessions belong to users (user_id foreign key)
- All tables include created_at and updated_at timestamps

## Development Commands

### Frontend (packages/frontend)
```bash
# Install dependencies
bun install

# Development server
bun dev

# Build for production
bun run build

# Run tests
bun test:unit

# Type checking
bun run type-check
```

### Backend (packages/backend)
```bash
# Install dependencies
bun install

# Development server with auto-reload
bun run dev

# Production server
bun start

# Database operations
bun run migrate:run     # Run pending migrations
bun run migrate:status  # Check migration status

# Build (if needed)
bun run build
```

### Root Level
```bash
# Install all dependencies (frontend + backend)
bun install

# Start both frontend and backend concurrently
bun dev

# Build both frontend and backend
bun run build
```

## Configuration & Environment

### Required Environment Variables

#### Backend (`packages/backend/.env`)
```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Encryption key for token storage (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
# Must be exactly 64 hex characters (32 bytes)
ENCRYPTION_KEY=your_64_character_hex_encryption_key_here

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/timely

# Environment
NODE_ENV=development
```

#### Frontend (`packages/frontend/.env.local`)
```bash
# Google OAuth (different from backend - for client-side usage)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# API endpoint for backend (optional, defaults to http://localhost:3000)
VITE_API_BASE_URL=http://localhost:3000
```

### Google OAuth Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Configure OAuth consent screen
5. Create OAuth 2.0 credentials (Web application)
6. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (development)
   - Your production domain callback URL
7. Copy the Client ID and Client Secret to your `.env` file
8. Generate an encryption key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Database Setup
1. Install PostgreSQL
2. Create a database named `timely`
3. Update `DATABASE_URL` in `.env` with your connection string
4. Run migrations: `bun run --cwd packages/backend migrate:run`

### Build Configuration
- **Vite Config**: `packages/frontend/vite.config.ts`
- **Backend Config**: `packages/backend/tsconfig.json`
- **Shared Config**: `packages/shared/tsconfig.json`
- Path aliases: `@` → `src/`

## Key Data Models

### User Tokens Interface
```typescript
interface UserTokens {
  userId: string;
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number;
  email: string;
  name: string;
  picture: string;
}
```

### Calendar Interface
```typescript
interface Calendar {
  id: string;
  summary: string;
  primary?: boolean;
  backgroundColor?: string;
  isEnabled?: boolean;
  events?: CalendarEvent[];
}
```

### CalendarEvent Interface
```typescript
interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string; };
  end: { dateTime?: string; date?: string; };
  location?: string;
  description?: string;
}
```

### Category Interface
```typescript
interface Category {
  id: string;
  name: string;
  color: string;
  keywords: string[];
  target: number; // percentage (0-100)
}
```

### Important Event Settings
```typescript
interface ImportantEventSettings {
  keywords: string[];
  enabled: boolean;
  displayLimit: number;
}
```

## Deployment

- **Platform**: Fly.io (configured via `fly.toml`)
- **Docker**: Containerized deployment with Dockerfile
- **CI/CD**: GitHub Actions workflow (`.github/workflows/fly-deploy.yml`)

## Development Notes

### Current State
- **Production-Ready Authentication**: Complete Google OAuth 2.0 integration with secure token storage
- **Real Google Calendar Data**: Fetches actual calendar events from authenticated users' Google accounts
- **Secure Session Management**: HTTP-only cookies with encrypted token storage
- **Categories**: Pre-configured for church/ministry use cases with automatic event categorization
- **Recent Fixes Applied**: Database column mapping corrected, categories primary key conflicts resolved, duplicate default categories removed

### Authentication Architecture

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

## Current Issues & Known Problems

### 🚨 Critical Issues
1. **Security**: Exposed OAuth credentials in committed `.env` file

### 🟡 TypeScript Configuration Issues
- Backend `tsconfig.json` doesn't include all source files
- Missing type declarations for some modules
- Import resolution issues

## Agent Instructions

When working with this codebase:

1. **Follow Vue 3 Composition API patterns** - use `<script setup>` syntax
2. **Maintain TypeScript types** - ensure all interfaces are properly typed
3. **Use existing stores** - leverage Pinia stores for state management
4. **Follow Tailwind/DaisyUI patterns** - use utility classes and DaisyUI components
5. **Preserve mock data structure** - maintain realistic test data for development
6. **Consider print styles** - the app has print optimization for calendar views
7. **Check package.json scripts** - use `bun` commands for all operations
8. **Maintain responsive design** - ensure mobile compatibility
9. **Follow existing naming conventions** - kebab-case for files, camelCase for variables
10. **Test type checking** - run `bun run type-check` after changes
11. **Parent-controlled visibility** - whether a component should be displayed or hidden is determined by the parent component, not by conditional rendering within the component itself
12. **Dev Server** - Ask the human to run the development server if it is not already running on port 3000. The dev server automatically restarts when changes are made.
13. **Environment Variables** - Document these in AGENTS.md instead of .env.example files so there is one source of truth for the configuration.

## Development Workflow

### Getting Started
1. **Clone the repository**
2. **Install dependencies**: `bun install`
3. **Set up environment variables** (see Configuration section)
4. **Set up database** and run migrations
5. **Start development servers**: `bun dev`

### Code Quality
- **Linting**: Run `bun run type-check` before committing
- **Testing**: Run `bun test:unit` for frontend tests
- **Database**: Run `bun run --cwd packages/backend migrate:status` to check migrations

### Deployment
- **Build**: `bun run build` (builds both frontend and backend)
- **Deploy**: Use Fly.io deployment configuration in `fly.toml`
- **Database**: Ensure production database is set up with all migrations applied

The codebase architecture is solid and has been updated with recent fixes to database column mapping, categories primary key conflicts, and duplicate default categories. The Vue 3 frontend with Pinia stores and the Elysia backend with PostgreSQL provide a robust foundation for the calendar management application. Note that security concerns regarding exposed OAuth credentials should be addressed before production deployment.