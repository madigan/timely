# AGENTS.md - Backend Package

## Project Overview
The **Timely Backend** is a Bun-based API server built with the Elysia web framework that provides secure authentication, Google Calendar integration, and data management for the Timely Calendar Application. It handles OAuth 2.0 flows, manages user sessions, and serves as the data layer for calendar events and categories.

## Tech Stack & Architecture

### Core Technologies
- **Runtime**: Bun
- **Web Framework**: ElysiaJS with TypeScript
- **Database**: PostgreSQL with Bun SQL
- **Authentication**: Google OAuth 2.0 with Google APIs
- **Security**: AES-256-CBC encryption for token storage
- **Session Management**: HTTP-only cookies with secure session storage

### Key Dependencies
```json
{
  "elysia": "^1.1.30",
  "@elysiajs/cors": "^1.1.1",
  "@elysiajs/static": "^1.1.1",
  "@elysiajs/cookie": "^0.8.0",
  "google-auth-library": "^10.3.0",
  "googleapis": "^158.0.0",
  "cookie": "^1.0.2",
  "@types/bun": "^1.1.11",
  "bun-types": "^1.1.30"
}
```

## Project Structure

```
packages/backend/
   migrations/
     202508271438.ts          # Initial database schema migration
     202509011459-important-events-settings.ts # Important events settings table
   src/
     env.ts                   # Environment configuration
     index.ts                 # Main server entry point
     server.ts                # Server setup and configuration
     services/
       auth/
         auth.middleware.ts   # Authentication middleware
         auth.routes.ts       # Authentication endpoints (/auth/*)
         auth.service.ts      # Authentication business logic
         tokens.service.ts    # Token encryption and management
       calendar/
         calendar.routes.ts   # Calendar API endpoints (/api/calendars/*)
         calendar.service.ts  # Google Calendar API integration
       categories/
         categories.routes.ts # Category management endpoints (/api/categories/*)
         categories.service.ts # Category business logic
       importantEvents/
         importantEvents.routes.ts # Important events settings endpoints (/api/important-events/*)
         importantEvents.service.ts # Important events settings management
       db/
         database.service.ts  # Database connection and queries
       health/
         health.routes.ts     # Health check endpoints
     scripts/
       migrate-status.ts      # Check migration status
       migrate.ts             # Run database migrations
   .gitignore
   package.json
   tsconfig.json
```

## Core Features & Functionality

### 1. Authentication System
- **OAuth Routes**: `src/routes/auth.routes.ts` - Handles Google OAuth flow
- **OAuth Service**: `src/services/auth/oauth.ts` - Google OAuth 2.0 setup and flow
- **Token Management**: `src/services/auth/tokens.ts` - Secure token storage and encryption

#### Implementation Details
- **Complete OAuth 2.0 Flow**: Server-side implementation with authorization code grant
- **Session Management**: HTTP-only cookies with secure session storage
- **Token Encryption**: AES-256-CBC encryption for stored access/refresh tokens
- **CSRF Protection**: State-based protection against cross-site request forgery
- **User Profile**: Fetches and stores user profile information from Google

### 2. Calendar Management
- **Calendar Service**: `src/services/calendar.ts` - Google Calendar API integration
- **Calendar Routes**: `src/routes/calendar.routes.ts` - Calendar endpoints

#### Features
- **Real Google Calendar Data**: Fetches actual calendar events from authenticated users
- **Multiple Calendar Support**: Handles multiple Google calendars
- **Event Filtering**: Date range and calendar-specific event retrieval
- **Authenticated Requests**: Secure API calls using stored OAuth tokens

### 3. Category Management
- **Category Service**: `src/services/categories/categories.service.ts` - Business logic
- **Category Routes**: `src/routes/categories.routes.ts` - CRUD endpoints

#### Features
- **CRUD Operations**: Create, read, update, delete categories
- **Keyword-based Classification**: Automatic event categorization
- **User-specific Categories**: Categories belong to individual users
- **Pre-configured Categories**: Default categories for church/ministry use cases

### 4. Important Events Management
- **Important Events Service**: `src/services/importantEvents/importantEvents.service.ts` - Settings management
- **Important Events Routes**: `src/routes/importantEvents.routes.ts` - Settings endpoints

#### Features
- **User-specific Settings**: Per-user important event keywords and preferences
- **Keyword-based Detection**: Configurable keywords for identifying important events
- **Display Limits**: Control number of important events shown
- **Default Settings**: Automatic creation of default settings for new users

### 4. Database Layer
- **Database Service**: `src/services/db/database.service.ts` - Connection and queries
- **Migrations**: `migrations/` - Database schema management

#### Schema
- **users**: User accounts with encrypted OAuth tokens
  - `id` (PRIMARY KEY, TEXT)
  - `access_token` (TEXT, encrypted with AES-256-CBC)
  - `refresh_token` (TEXT, optional, encrypted with AES-256-CBC)
  - `expiry_date` (BIGINT, timestamp)
  - `email`, `name`, `picture` (user profile)
  - `created_at`, `updated_at` (TIMESTAMP)
- **sessions**: User session management with expiration
  - `session_id` (PRIMARY KEY, TEXT)
  - `user_id` (TEXT, foreign key to users.id)
  - `created_at` (TIMESTAMP)
  - `expires_at` (TIMESTAMP, default CURRENT_TIMESTAMP + 30 days)
- **categories**: User-defined categories with keywords and targets
  - `id` (PRIMARY KEY, TEXT, default gen_random_uuid())
  - `user_id` (TEXT, foreign key to users.id, ON DELETE CASCADE)
  - `name` (TEXT)
  - `color` (TEXT, hex color code)
  - `keywords` (TEXT[], array of keywords)
  - `target` (INTEGER, 0-100)
  - `created_at`, `updated_at` (TIMESTAMP)
- **important_event_settings**: User-specific important event keywords and preferences
  - `id` (PRIMARY KEY, TEXT, default gen_random_uuid())
  - `user_id` (TEXT, foreign key to users.id, ON DELETE CASCADE)
  - `keywords` (TEXT[], array of keywords)
  - `enabled` (BOOLEAN, default true)
  - `display_limit` (INTEGER, 1-20, default 3)
  - `created_at`, `updated_at` (TIMESTAMP)
- **migrations**: Migration tracking
  - `name` (PRIMARY KEY, TEXT)
  - `status` (TEXT)
  - `created_at`, `updated_at` (TIMESTAMP)

## Development Commands

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

# Type checking
bun run type-check
```

## Configuration & Environment

### Required Environment Variables (`packages/backend/.env`)

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Encryption key for token storage (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
# Must be exactly 64 hex characters (32 bytes)
ENCRYPTION_KEY=your_64_character_hex_encryption_key_here

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/timely

# Environment
NODE_ENV=development
```

### Google OAuth Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Configure OAuth consent screen
5. Create OAuth 2.0 credentials (Web application)
 6. Add authorized redirect URIs:
    - `http://localhost:3000/api/auth/google/callback` (development)
    - Your production domain callback URL
7. Copy the Client ID and Client Secret to your `.env` file
8. Generate an encryption key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Database Setup
1. Install PostgreSQL
2. Create a database named `timely`
3. Update `DATABASE_URL` in `.env` with your connection string
4. Run migrations: `bun run migrate:run`

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

### Category Interface
```typescript
interface Category {
  id: string;
  name: string;
  color: string;
  keywords: string[];
  target: number; // percentage (0-100)
  userId: string;
}
```

### Important Event Settings Interface
```typescript
interface ImportantEventSettings {
  id: string
  userId: string
  keywords: string[]
  enabled: boolean
  displayLimit: number
  createdAt: string
  updatedAt: string
}

interface ImportantEventSettingsInput {
  keywords: string[]
  enabled: boolean
  displayLimit: number
}
```

### Database Tables
- **users**: `id`, `access_token`, `refresh_token`, `expiry_date`, `email`, `name`, `picture`, `created_at`, `updated_at`
- **sessions**: `session_id`, `user_id`, `created_at`, `expires_at`
- **categories**: `id`, `user_id`, `name`, `color`, `keywords`, `target`, `created_at`, `updated_at`
- **important_event_settings**: `id`, `user_id`, `keywords`, `enabled`, `display_limit`, `created_at`, `updated_at`
- **migrations**: `name`, `status`, `created_at`, `updated_at`

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - OAuth callback handler
- `POST /auth/logout` - Logout and clear session
- `GET /auth/profile` - Get current user profile information

### Calendar
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

## Security Features

- **CSRF Protection**: State parameter in OAuth flow
- **Token Encryption**: AES-256-CBC for stored OAuth tokens
- **HTTP-Only Cookies**: Session cookies not accessible to JavaScript
- **Secure Sessions**: In-memory session management with unique IDs
- **Token Refresh**: Automatic handling of expired access tokens

## Agent Instructions

When working with the backend package:

1. **Follow ElysiaJS patterns** - Use Elysia's routing and middleware system
2. **Maintain TypeScript types** - Ensure all API responses and requests are properly typed
3. **Use secure practices** - Never log sensitive information, use encryption for tokens
4. **Handle errors gracefully** - Implement proper error handling and logging
5. **Database safety** - Use parameterized queries and validate inputs
6. **OAuth security** - Follow OAuth 2.0 best practices and security guidelines
7. **Session management** - Properly handle session creation, validation, and cleanup
8. **API versioning** - Consider versioning for future API changes
9. **Environment variables** - Never commit sensitive data, use proper env validation
10. **Testing** - Write unit tests for services and integration tests for routes
11. **Documentation** - Keep API documentation up-to-date
12. **Performance** - Optimize database queries and API response times
13. **Logging** - Implement structured logging for debugging and monitoring

## Development Workflow

### Getting Started
1. **Navigate to backend directory**: `cd packages/backend`
2. **Install dependencies**: `bun install`
3. **Set up environment variables** (see Configuration section)
4. **Set up database** and run migrations
5. **Start development server**: `bun run dev`

### Code Quality
- **Type checking**: Run `bun run type-check` before committing
- **Database migrations**: Always check migration status before pushing
- **Security review**: Review code for potential security vulnerabilities

### Testing
- **Unit tests**: Test individual services and utilities
- **Integration tests**: Test API endpoints and database interactions
- **OAuth flow testing**: Test authentication flows carefully

The backend provides a secure and robust API foundation for the Timely Calendar Application, handling all authentication, data management, and Google Calendar integration requirements.