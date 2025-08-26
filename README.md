# Timely

Timely is a monorepo web application that allows you to import your Google Calendar, categorize events, and visualize how much time you are spending in each category.

## Architecture

This project is structured as a monorepo with the following packages:

- **`packages/frontend/`** - Vue 3 web application
- **`packages/backend/`** - Bun + Elysia API server
- **`packages/shared/`** - Shared TypeScript types and utilities

## Tech Stack

### Frontend
- **Vue 3** with TypeScript and Composition API
- **Vite** for build tooling and development server
- **Tailwind CSS v4** + **DaisyUI** for styling
- **Pinia** for state management
- **Vue Router** for client-side routing

### Backend
- **Bun** runtime for high-performance JavaScript execution
- **Elysia** web framework for API endpoints
- Static file serving for the Vue frontend

### Shared
- **TypeScript** interfaces and utilities shared between frontend and backend

## Installation

```sh
bun install
```

This will install dependencies for all packages in the workspace.

## Development

Start both frontend and backend development servers:

```sh
bun dev
```

This runs:
- Frontend development server on `http://localhost:5173` (Vite)
- Backend development server on `http://localhost:3000` (Elysia with hot reload)

## Build

Build the frontend for production:

```sh
bun run build
```

This builds the Vue app and copies the static files to the backend's static directory.

## Production

Start the production server:

```sh
bun start
```

This serves the built Vue app and API endpoints on `http://localhost:3000`.

## API Endpoints

- `GET /api/hello-world` - Test endpoint that returns a JSON response
- `GET /api/health` - Health check endpoint

## Testing

Run frontend unit tests:

```sh
bun test
```

Run TypeScript type checking:

```sh
bun type-check
```

## Deployment

This application is configured for deployment on **Fly.io** using the included `Dockerfile` and `fly.toml` configuration.

The deployment process:
1. Builds the Vue frontend
2. Creates a Bun-based Docker container
3. Serves both the API and static files from a single server

## Package Structure

```
timely/
├── packages/
│   ├── shared/           # Shared utilities and types
│   ├── frontend/         # Vue 3 application
│   └── backend/          # Elysia API server
├── package.json          # Root workspace configuration
├── Dockerfile           # Bun-based deployment
└── fly.toml            # Fly.io configuration
```