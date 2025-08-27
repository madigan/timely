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

### Key Dependencies

#### Frontend
```json
{
  "vue": "^3.5.18",
  "pinia": "^3.0.3",
  "vue-router": "^4.5.1",
  "tailwindcss": "^4.1.11",
  "daisyui": "^5.0.50"
}
```

#### Backend
```json
{
  "elysia": "^1.1.30",
  "@elysiajs/cors": "^1.1.1",
  "@elysiajs/static": "^1.1.1",
  "google-auth-library": "^10.3.0",
  "googleapis": "^158.0.0"
}
```

## Project Structure

### Monorepo Architecture
```
packages/
├── frontend/         # Vue.js frontend application
│   └── src/
│       ├── assets/           # CSS and static assets
│       ├── components/       # Vue components
│       │   ├── CalendarGrid.vue        # Main calendar display
│       │   ├── CalendarMonth.vue       # Monthly calendar view
│       │   ├── CategoryModal.vue       # Category management UI
│       │   ├── FeaturesSection.vue     # Landing page features
│       │   ├── Footer.vue             # App footer
│       │   ├── Header.vue             # App header with nav
│       │   ├── HeroSection.vue        # Landing page hero
│       │   └── ImportantEventsAccordion.vue
│       ├── router/           # Vue Router configuration
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
└── backend/          # Elysia/Bun backend API
    └── src/
        ├── auth/             # Authentication modules
        │   ├── oauth.ts              # Google OAuth configuration
        │   └── tokens.ts             # Token management & sessions
        ├── routes/           # API route handlers
        │   ├── auth.ts               # Authentication endpoints
        │   └── calendar.ts           # Calendar API endpoints
        ├── services/         # Business logic services
        │   └── calendar.ts           # Google Calendar API integration
        └── index.ts          # Server entry point
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
- **Location**: `packages/frontend/src/stores/categories.ts`
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

# Build (if needed)
bun run build
```

### Root Level
```bash
# Install all dependencies (frontend + backend)
bun install

# Start both frontend and backend concurrently
bun dev
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

# Environment
NODE_ENV=development
```

#### Frontend (`packages/frontend/.env`)
```bash
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

See `GOOGLE_OAUTH_SETUP.md` for detailed setup instructions.

### Build Configuration
- **Vite Config**: `vite.config.ts`
- TypeScript configuration with multiple tsconfig files
- Path aliases: `@` → `src/`

## Key Data Models

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

The codebase is well-structured and follows modern Vue 3 best practices with a focus on calendar management and event categorization for organizational time tracking.