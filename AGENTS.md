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
Timely uses a monorepo structure with three main packages:

- **[Backend Package](./packages/backend/AGENTS.md)**: Bun-based API server with Elysia framework
- **[Frontend Package](./packages/frontend/AGENTS.md)**: Vue 3 SPA with TypeScript and Tailwind CSS
- **[Shared Package](./packages/shared/AGENTS.md)**: Common TypeScript types and utilities

### Root Level Files
- `.github/workflows/fly-deploy.yml` - CI/CD pipeline for Fly.io deployment
- `docker-compose.yml` - Local development environment
- `fly.toml` - Fly.io deployment configuration
- `package.json` - Root package configuration with workspace setup

## Core Features & Functionality

### 1. Authentication System
Complete Google OAuth 2.0 integration with secure session management and token encryption.
- See [Backend Package](./packages/backend/AGENTS.md#1-authentication-system) for implementation details
- See [Frontend Package](./packages/frontend/AGENTS.md#1-authentication-system) for client-side integration

### 2. Calendar Management
Real-time Google Calendar integration with multiple calendar support and event filtering.
- See [Backend Package](./packages/backend/AGENTS.md#2-calendar-management) for API implementation
- See [Frontend Package](./packages/frontend/AGENTS.md#2-calendar-management) for UI components

### 3. Event Categorization
Keyword-based automatic event classification with customizable categories and time tracking.
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

### Package-Specific Commands
- **[Frontend Commands](./packages/frontend/AGENTS.md#development-commands)**: Vue development server, building, and testing
- **[Backend Commands](./packages/backend/AGENTS.md#development-commands)**: API server, database migrations, and deployment

### Root Level Commands
```bash
# Install all dependencies (frontend + backend + shared)
bun install

# Start both frontend and backend concurrently
bun dev

# Build both frontend and backend
bun run build
```

## Configuration & Environment

### Environment Variables
- **[Backend Configuration](./packages/backend/AGENTS.md#configuration--environment)**: Google OAuth, database, and encryption settings
- **[Frontend Configuration](./packages/frontend/AGENTS.md#configuration--environment)**: Google OAuth client ID and API endpoints
- **[Shared Configuration](./packages/shared/AGENTS.md#configuration--environment)**: TypeScript compilation settings

### Setup Requirements
- **Google OAuth Setup**: Configure Google Cloud Console for Calendar API access
- **Database Setup**: PostgreSQL configuration and migration setup
- **Build Configuration**: Vite, TypeScript, and package-specific build settings

## Key Data Models

All shared data models and TypeScript interfaces are defined in the [Shared Package](./packages/shared/AGENTS.md#key-data-models), including:

- User and authentication interfaces
- Calendar and event data structures
- Category definitions
- API response types
- Configuration interfaces

See the [Shared Package documentation](./packages/shared/AGENTS.md) for complete type definitions.

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

## Development Workflow

### Getting Started
1. **Clone the repository**
2. **Install dependencies**: `bun install`
3. **Set up environment variables** (see package-specific configuration)
4. **Set up database** and run migrations
5. **Start development servers**: `bun dev`

### Package-Specific Workflows
- **[Frontend Development](./packages/frontend/AGENTS.md#development-workflow)**: Component development and testing
- **[Backend Development](./packages/backend/AGENTS.md#development-workflow)**: API development and database management
- **[Shared Development](./packages/shared/AGENTS.md#development-workflow)**: Type and utility development

### Code Quality
- **Type checking**: Run package-specific type checking commands
- **Testing**: Execute tests in each package as needed
- **Database**: Check migration status before deployment

### Deployment
- **Build**: `bun run build` (builds both frontend and backend)
- **Deploy**: Use Fly.io deployment configuration in `fly.toml`
- **Database**: Ensure production database is set up with all migrations applied

The codebase architecture is solid and has been updated with recent fixes to database column mapping, categories primary key conflicts, and duplicate default categories. The Vue 3 frontend with Pinia stores and the Elysia backend with PostgreSQL provide a robust foundation for the calendar management application. Note that security concerns regarding exposed OAuth credentials should be addressed before production deployment.