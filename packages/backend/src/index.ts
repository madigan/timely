import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static';
import { cors } from '@elysiajs/cors';
import { authRoutes } from './routes/auth.js';
import { calendarRoutes } from './routes/calendar.js';

const PORT = process.env.PORT || 3000;

const app = new Elysia({
  cookie: {
    secrets: 'session-secret-key'  // Built-in cookie support with secret
    // Don't sign all cookies by default to avoid validation issues
  }
})
  .use(cors({
    credentials: true,
    origin: true // Allow all origins in development
  }))
  // Authentication routes
  .use(authRoutes)
  // Calendar API routes
  .use(calendarRoutes)
  // Health check endpoint
  .get('/api/health', () => ({
    status: 'healthy',
    timestamp: new Date().toISOString()
  }))
  // Static files with SPA fallback support
  .use(staticPlugin({
    assets: 'static',
    prefix: '',
    indexHTML: true
  }))
  .listen(PORT, () => {
    console.log(`🚀 Timely server is running on http://localhost:${PORT}`);
  });

