# AGENTS.md - Shared Package

## Project Overview
The **Timely Shared** package contains common TypeScript types, interfaces, and utility functions used across both the frontend and backend packages. It serves as a central location for shared data models and helper functions, ensuring type consistency and code reusability throughout the application.

## Tech Stack & Architecture

### Core Technologies
- **Language**: TypeScript
- **Package Manager**: Bun
- **Build Tool**: TypeScript Compiler

### Key Dependencies
```json
{
  "typescript": "^5.6.3"
}
```

## Project Structure

```
packages/shared/
  src/
    types/
      index.ts               # Main types export file
    utils/
      index.ts               # Main utilities export file
    index.ts                 # Main package export
  package.json
  tsconfig.json
```

## Core Features & Functionality

### 1. Type Definitions
- **Location**: `src/types/index.ts`
- Centralized type definitions for the entire application
- Ensures type consistency between frontend and backend

### 2. Utility Functions
- **Location**: `src/utils/index.ts`
- Common utility functions used across packages
- Helper functions for data manipulation and validation

## Development Commands

```bash
# Install dependencies
bun install

# Type checking
bun run type-check

# Build (if needed)
bun run build
```

## Configuration & Environment

### TypeScript Configuration (`packages/shared/tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Key Data Models

### User Interface
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}
```

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

### API Response Types
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
```

## Utility Functions

### Data Validation
```typescript
// Example utility functions that might be included
function isValidEmail(email: string): boolean;
function isValidCategory(category: Partial<Category>): boolean;
function sanitizeString(input: string): string;
```

### Data Transformation
```typescript
// Example transformation utilities
function formatDate(date: Date): string;
function calculateDuration(start: string, end: string): number;
function groupEventsByCategory(events: CalendarEvent[], categories: Category[]): Record<string, CalendarEvent[]>;
```

### Constants
```typescript
// Common constants used across packages
const DEFAULT_CATEGORIES: Category[];
const COLOR_PALETTE: string[];
const DATE_FORMAT: string;
```

## Package Exports

### Main Export (`src/index.ts`)
```typescript
// Re-export all types and utilities
export * from './types';
export * from './utils';
```

### Types Export (`src/types/index.ts`)
```typescript
// Export all type definitions
export type { User, UserTokens, Calendar, CalendarEvent, Category, ImportantEventSettings };
export type { ApiResponse, PaginatedResponse };
```

### Utils Export (`src/utils/index.ts`)
```typescript
// Export all utility functions
export { isValidEmail, formatDate, calculateDuration };
export { DEFAULT_CATEGORIES, COLOR_PALETTE };
```

## Agent Instructions

When working with the shared package:

1. **Type consistency** - Ensure all types are accurately defined and used consistently across packages
2. **Utility purity** - Keep utility functions pure and well-tested
3. **Minimal dependencies** - Avoid adding heavy dependencies that could bloat the shared package
4. **Documentation** - Document all exported types and functions with JSDoc comments
5. **Version compatibility** - Ensure changes don't break existing imports in other packages
6. **Type safety** - Use strict TypeScript settings to catch type errors early
7. **Naming conventions** - Follow consistent naming patterns for types and functions
8. **Export strategy** - Use barrel exports to simplify imports in consuming packages
9. **Testing** - Write unit tests for all utility functions
10. **Performance** - Keep utility functions lightweight and efficient
11. **Backward compatibility** - Avoid breaking changes to existing exports
12. **Code organization** - Group related types and functions logically

## Development Workflow

### Getting Started
1. **Navigate to shared directory**: `cd packages/shared`
2. **Install dependencies**: `bun install`
3. **Start development**: Make changes to types or utilities as needed

### Code Quality
- **Type checking**: Run `bun run type-check` to ensure type safety
- **Testing**: Write and run tests for utility functions
- **Documentation**: Keep JSDoc comments up-to-date

### Publishing Changes
- **Build**: Run `bun run build` to generate declaration files
- **Version bump**: Update package version for breaking changes
- **Cross-package testing**: Ensure changes don't break frontend or backend

The shared package serves as the foundation for type safety and code reusability across the Timely Calendar Application, ensuring consistency and maintainability.