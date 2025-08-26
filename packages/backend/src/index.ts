import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static';
import { cors } from '@elysiajs/cors';

const app = new Elysia()
  .use(cors())
  
  // API Routes (defined before static plugin for proper routing priority)
  .get('/api/hello-world', () => ({
    message: 'Hello from Timely API!',
    timestamp: new Date().toISOString(),
    status: 'success'
  }))
  
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
  
  .listen(process.env.PORT || 3000, () => {
    const port = process.env.PORT || 3000;
    console.log(`🚀 Timely server is running on http://localhost:${port}`);
    console.log(`📡 API available at http://localhost:${port}/api/hello-world`);
  });

