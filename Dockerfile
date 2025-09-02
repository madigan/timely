# Use Bun runtime
FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lockb* ./
COPY packages/ ./packages/
RUN bun install --frozen-lockfile

# Build frontend and copy to backend static directory
RUN ls -al packages/frontend
RUN bun run --cwd packages/frontend build

EXPOSE 3000
CMD ["bun", "start"]
