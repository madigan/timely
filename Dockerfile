# Use Bun runtime
FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lockb* ./
COPY packages/ ./packages/
RUN bun install --frozen-lockfile

# Build frontend and copy to backend static directory
RUN ls -al packages/frontend
RUN bun run build

# Set production environment
ENV NODE_ENV=production

# Verify the static files were created
RUN ls -al packages/backend/static/

EXPOSE 3000
WORKDIR /app/packages/backend
CMD ["bun", "src/index.ts"]
