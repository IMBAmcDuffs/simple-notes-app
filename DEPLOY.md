# Deployment Documentation

## Project Structure

```
simple-notes-app/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Main page
│   ├── components/       # React components
│   │   ├── Header.tsx
│   │   ├── SearchBar.tsx
│   │   ├── NoteList.tsx
│   │   ├── NoteCard.tsx
│   │   └── NoteEditor.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useNotes.ts
│   └── types/            # TypeScript types
│       └── note.ts
├── tests/                # Test files
├── research/             # Research documentation
├── _templates/           # Design templates
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Prerequisites

- **Node.js**: v18.0 or higher
- **npm**: v8.0 or higher (comes with Node.js)
- **Docker**: v20.0 or higher (for containerized deployment)

## Install Commands

```bash
# Install dependencies
npm install
```

## Build Commands

```bash
# Build for production
npm run build
```

## Run Commands

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

## Ports

- **Development**: Port 3000 (configurable via `PORT` environment variable)
- **Production**: Port 3000 (default, configurable via `PORT` environment variable)

## Environment Variables

No environment variables are required for this application. All data is stored in browser localStorage.

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

### Build and Run Docker Container

```bash
# Build the Docker image
docker build -t simple-notes-app .

# Run the container
docker run -p 3000:3000 simple-notes-app
```

### Docker Compose (Optional)

```yaml
version: '3.8'

services:
  notes-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

## Verification

After deployment, verify the application is running:

```bash
# Check if the server is responding
curl http://localhost:3000

# Or open in browser
# http://localhost:3000
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Use a different port
PORT=3001 npm run dev
```

### Build Failures

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Docker Issues

```bash
# Rebuild without cache
docker build --no-cache -t simple-notes-app .

# Check container logs
docker logs <container_id>
```
