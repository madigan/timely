# AGENTS.md - Frontend Package

## Project Overview
The **Timely Frontend** is a Vue 3 single-page application built with TypeScript that provides an intuitive interface for users to import their Google Calendar, categorize events, and visualize time allocation across different categories. Designed for organizations (particularly churches) to track and analyze their event time allocation.

## Tech Stack & Architecture

### Core Technologies
- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 + DaisyUI components
- **State Management**: Pinia stores
- **Routing**: Vue Router v4
- **Testing**: Vitest with Vue Test Utils
- **Package Manager**: Bun

### Key Dependencies
```json
{
  "vue": "^3.5.18",
  "pinia": "^3.0.3",
  "vue-router": "^4.5.1",
  "tailwindcss": "^4.1.11",
  "daisyui": "^5.0.50",
  "vue3-google-login": "^2.0.34",
  "@vue/test-utils": "^2.4.6",
  "jsdom": "^25.0.1",
  "vitest": "^2.1.3"
}
```

## Project Structure

```
packages/frontend/
  public/
    favicon.ico              # Application favicon
  src/
    assets/
      base.css               # Base styles
      logo.svg               # Application logo
      main.css               # Main stylesheet
    components/
      CalendarGrid.vue       # Monthly calendar grid display
      CalendarMonth.vue      # Individual month component
      CategoryModal.vue      # Category creation/editing modal
      CategorySettings.vue   # Category management interface
      FeaturesSection.vue    # Landing page features section
      Footer.vue             # Application footer
      Header.vue             # Application header with navigation
      HeroSection.vue        # Landing page hero section
      ImportantEventsPanel.vue # Important events display
      ImportantEventsSettings.vue # Important events configuration
      MonthAnalyticsModal.vue # Monthly analytics modal
      MonthlyStatsPanel.vue  # Monthly statistics display
      WeeklyStatsPanel.vue   # Weekly statistics display
    constants/
      display.ts             # Display-related constants
    lib/
      __tests__/
        eventAnalytics.test.ts # Analytics tests
      eventAnalytics.ts      # Event analytics utilities
    router/
      index.ts               # Vue Router configuration
    stores/
      auth.ts                # Authentication state management
      calendars.ts           # Calendar data state
      categories.ts          # Category state management
      importantEvents.ts     # Important events state
      toast.ts               # Toast notification state
    utils/
      events.ts              # Event utility functions
    views/
      HomeView.vue           # Main application view
      SettingsView.vue       # Settings page
    App.vue                  # Root Vue component
    main.ts                  # Application entry point
  env.d.ts                   # TypeScript environment declarations
  index.html                 # HTML template
  package.json
  tsconfig.app.json
  tsconfig.json
  tsconfig.node.json
  tsconfig.vitest.json
  vite.config.ts
  vitest.config.ts
```

## Core Features & Functionality

### 1. Authentication System
- **Auth Store**: `src/stores/auth.ts` - Manages user authentication state
- **Google OAuth Integration**: Client-side OAuth handling with Google
- **Session Management**: Automatic session validation and refresh

#### Features
- **Login/Logout**: Seamless authentication flow
- **User Profile**: Display user information and profile picture
- **Session Persistence**: Maintains login state across browser sessions

### 2. Calendar Management
- **Calendar Store**: `src/stores/calendars.ts` - Calendar data state
- **Calendar Components**: `CalendarGrid.vue`, `CalendarMonth.vue`
- **API Integration**: Fetches calendar data from backend

#### Features
- **Multiple Calendar Support**: Handle multiple Google calendars
- **Calendar Selection**: Enable/disable specific calendars
- **Event Display**: Visual representation of calendar events
- **Date Filtering**: Filter events by date ranges

### 3. Event Categorization
- **Category Store**: `src/stores/categories.ts` - Category state management
- **Category Components**: `CategoryModal.vue`, `CategorySettings.vue`
- **Keyword Matching**: Automatic event classification

#### Features
- **CRUD Operations**: Create, read, update, delete categories
- **Color Coding**: Visual category identification
- **Keyword Configuration**: Custom keywords for auto-categorization
- **Target Percentages**: Set time allocation targets per category

### 4. Analytics & Reporting
- **Analytics Library**: `src/lib/eventAnalytics.ts` - Event analysis utilities
- **Stats Components**: `MonthlyStatsPanel.vue`, `WeeklyStatsPanel.vue`
- **Analytics Modal**: `MonthAnalyticsModal.vue`

#### Features
- **Time Tracking**: Calculate time spent in each category
- **Monthly Reports**: Monthly time allocation analysis
- **Weekly Reports**: Weekly statistics and trends
- **Print Optimization**: Print-friendly report layouts

### 5. Important Events Tracking
- **Important Events Store**: `src/stores/importantEvents.ts`
- **Settings Component**: `ImportantEventsSettings.vue`
- **Utility Functions**: `src/utils/events.ts`

#### Features
- **Keyword-based Detection**: Identify important events
- **Customizable Criteria**: Configure importance keywords
- **Event Filtering**: Filter and highlight important events
- **Display Limits**: Control number of displayed important events

### 6. User Interface Components
- **Navigation**: `Header.vue` with responsive navigation
- **Landing Page**: `HeroSection.vue`, `FeaturesSection.vue`
- **Settings Page**: `SettingsView.vue` for user preferences
- **Toast Notifications**: `src/stores/toast.ts` for user feedback

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

# Preview production build
bun run preview
```

## Configuration & Environment

### Environment Variables (`packages/frontend/.env.local`)

```bash
# Google OAuth (client-side usage)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# API endpoint for backend (optional, defaults to http://localhost:3000)
VITE_API_BASE_URL=http://localhost:3000
```

### API Integration
The frontend communicates with the backend API using the following route structure:
- **API Calls**: All backend API endpoints are prefixed with `/api/*`
- **Authentication**: Auth-related endpoints use `/api/auth/*`
- **Static Assets**: All other routes (`/*`) serve the SPA's static assets

Example API calls:
- Authentication: `${VITE_API_BASE_URL}/api/auth/profile`
- Calendar data: `${VITE_API_BASE_URL}/api/calendars/events`
- Categories: `${VITE_API_BASE_URL}/api/categories`
- Important events: `${VITE_API_BASE_URL}/api/important-events/settings`

### Build Configuration
- **Vite Config**: `vite.config.ts` - Build tool configuration
- **TypeScript Configs**:
  - `tsconfig.json` - Base TypeScript configuration
  - `tsconfig.app.json` - Application-specific types
  - `tsconfig.node.json` - Node.js types for build tools
  - `tsconfig.vitest.json` - Test-specific types
- **Path Aliases**: `@` → `src/` for clean imports

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

### Important Event Settings
```typescript
interface ImportantEventSettings {
  keywords: string[];
  enabled: boolean;
  displayLimit: number;
}
```

### User Interface
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}
```

## Component Architecture

### Page Components (Views)
- **HomeView.vue**: Main application interface with calendar and analytics
- **SettingsView.vue**: User preferences and configuration

### Feature Components
- **CalendarGrid.vue**: Monthly calendar visualization
- **MonthlyStatsPanel.vue**: Monthly time allocation statistics
- **WeeklyStatsPanel.vue**: Weekly statistics display
- **ImportantEventsPanel.vue**: Important events list

### Modal Components
- **CategoryModal.vue**: Category creation and editing
- **MonthAnalyticsModal.vue**: Detailed monthly analytics

### Layout Components
- **Header.vue**: Navigation and user menu
- **Footer.vue**: Application footer

## State Management (Pinia Stores)

### Auth Store (`src/stores/auth.ts`)
- User authentication state
- Login/logout actions
- Session management

### Calendar Store (`src/stores/calendars.ts`)
- Calendar data management
- Event fetching and caching
- Calendar selection state

### Category Store (`src/stores/categories.ts`)
- Category CRUD operations
- Keyword matching logic
- Category state persistence

### Important Events Store (`src/stores/importantEvents.ts`)
- Important events configuration
- Event filtering logic

### Toast Store (`src/stores/toast.ts`)
- Notification management
- User feedback messages

## Routing Configuration

The frontend is a single-page application (SPA) that handles all non-API routes (`/*`) by serving static assets. The Vue Router manages client-side navigation for the following routes:

```typescript
// src/router/index.ts
const routes = [
  { path: '/', component: HomeView },
  { path: '/settings', component: SettingsView }
]
```

**Note**: API routes (`/api/*`) are handled by the backend server, while all other routes serve the SPA's static assets.

## Testing Setup

- **Framework**: Vitest for unit testing
- **DOM Testing**: jsdom for component testing
- **Vue Testing**: @vue/test-utils for Vue component testing
- **Test Files**: Located in `__tests__/` directories

## Agent Instructions

When working with the frontend package:

1. **Follow Vue 3 Composition API patterns** - Use `<script setup>` syntax for all components
2. **Maintain TypeScript types** - Ensure all props, emits, and reactive data are properly typed
3. **Use Pinia stores** - Leverage existing stores for state management instead of local state
4. **Follow Tailwind/DaisyUI patterns** - Use utility classes and DaisyUI components for styling
5. **Component naming** - Use PascalCase for component files, kebab-case for component tags
6. **Responsive design** - Ensure mobile compatibility and responsive layouts
7. **Print optimization** - Consider print styles for calendar and report views
8. **Performance** - Use Vue's reactivity system efficiently, avoid unnecessary re-renders
9. **Accessibility** - Follow accessibility best practices for all components
10. **Testing** - Write unit tests for components and utilities
11. **Code organization** - Keep components focused on single responsibilities
12. **State persistence** - Handle state persistence appropriately for user experience
13. **Error handling** - Implement proper error handling and user feedback
14. **API integration** - Handle loading states and error responses from backend
15. **Environment variables** - Use VITE_ prefix for client-side environment variables

## Development Workflow

### Getting Started
1. **Navigate to frontend directory**: `cd packages/frontend`
2. **Install dependencies**: `bun install`
3. **Set up environment variables** (see Configuration section)
4. **Start development server**: `bun dev`

### Code Quality
- **Type checking**: Run `bun run type-check` before committing
- **Testing**: Run `bun test:unit` for unit tests
- **Linting**: Follow consistent code style and formatting

### Component Development
- **Composition API**: Use `<script setup>` for new components
- **Props/Emits**: Define component interfaces with proper typing
- **Reactivity**: Use `ref` and `computed` appropriately
- **Lifecycle**: Handle component lifecycle with `onMounted`, `onUnmounted`, etc.

### State Management
- **Store Structure**: Keep stores focused on specific domains
- **Actions**: Use async actions for API calls
- **Getters**: Use computed getters for derived state

The frontend provides a modern, responsive interface for the Timely Calendar Application, built with Vue 3 and TypeScript for maintainability and performance.