# AGENTS.md - Timely Calendar Application

## Project Overview
**Timely** is a Vue 3 web application that helps users import their Google Calendar, categorize events, and visualize time spent in each category. It's designed for organizations (particularly churches) to track and analyze their event time allocation.

## Tech Stack & Architecture

### Core Technologies
- **Frontend**: Vue 3 with TypeScript and Composition API
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 + DaisyUI components
- **State Management**: Pinia stores
- **Routing**: Vue Router v4
- **Package Manager**: Bun
- **Authentication**: vue3-google-login plugin

### Key Dependencies
```json
{
  "vue": "^3.5.18",
  "pinia": "^3.0.3",
  "vue-router": "^4.5.1",
  "vue3-google-login": "^2.0.34",
  "tailwindcss": "^4.1.11",
  "daisyui": "^5.0.50"
}
```

## Project Structure

```
src/
├── assets/           # CSS and static assets
├── components/       # Vue components
│   ├── CalendarGrid.vue        # Main calendar display
│   ├── CalendarMonth.vue       # Monthly calendar view
│   ├── CategoryModal.vue       # Category management UI
│   ├── FeaturesSection.vue     # Landing page features
│   ├── Footer.vue             # App footer
│   ├── Header.vue             # App header with nav
│   ├── HeroSection.vue        # Landing page hero
│   └── ImportantEventsAccordion.vue
├── router/           # Vue Router configuration
├── stores/           # Pinia state management
│   ├── auth.ts                # User authentication
│   ├── calendars.ts           # Calendar data & events
│   ├── categories.ts          # Event categorization
│   └── importantEvents.ts     # Important events filtering
├── utils/            # Utility functions
│   └── events.ts              # Event processing utilities
├── views/            # Page components
│   ├── HomeView.vue           # Main dashboard/landing
│   └── SettingsView.vue       # App configuration
├── App.vue           # Root component
└── main.ts           # Application entry point
```

## Core Features & Functionality

### 1. Authentication System
- **Location**: `src/stores/auth.ts`
- Google OAuth integration via vue3-google-login
- Currently uses mock data for development
- User state management with Pinia

### 2. Calendar Management
- **Location**: `src/stores/calendars.ts`
- Multiple calendar support with enable/disable toggles
- Dummy data generation for development/testing
- Event filtering by date ranges
- Calendar-specific event retrieval

### 3. Event Categorization
- **Location**: `src/stores/categories.ts`
- Keyword-based automatic event classification
- Color-coded categories with target time percentages
- CRUD operations for category management
- Pre-configured categories: Worship, Fellowship, Outreach, Education, Music

### 4. Calendar Visualization
- **Location**: `src/components/CalendarGrid.vue`
- Monthly grid view with event display
- Date range filtering
- Print-optimized layout
- Responsive design with mobile support

### 5. Important Events Tracking
- **Location**: `src/stores/importantEvents.ts`, `src/utils/events.ts`
- Keyword-based importance detection
- Event filtering and sorting utilities
- Configurable importance criteria

## Development Commands

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

## Configuration & Environment

### Required Environment Variables
```bash
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

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
- Uses dummy/mock data for calendars and events
- Google OAuth integration is configured but uses mock authentication
- Event generation includes realistic church-related events
- Categories are pre-configured for church/ministry use cases

### Key Patterns
- **Composition API**: All Vue components use `<script setup>` syntax
- **Pinia Stores**: Reactive state management with composable pattern
- **TypeScript**: Full type safety with interfaces for all data models
- **CSS Framework**: Utility-first with Tailwind + DaisyUI components
- **Responsive Design**: Mobile-first approach with print optimization

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