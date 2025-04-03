# Dockerfile for Next.js application using pnpm

# ---- Base Stage ----
# Use Node.js 20 Alpine as a base image
FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# ---- Dependencies Stage ----
# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package manager files and other necessary config files
COPY package.json pnpm-lock.yaml ./
COPY tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs ./
# Copy .env.local if needed for build-time environment variables (Next.js often handles this automatically)
# COPY .env.local ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# ---- Build Stage ----
# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies from the previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml ./
COPY tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs ./

# Copy the rest of the application source code
COPY . .

# Build the Next.js application
# Ensure NEXT_PUBLIC_ variables are available during build if needed
# You might need to pass them as build arguments if they are required at build time
# Example: ARG NEXT_PUBLIC_SUPABASE_URL
# ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
RUN pnpm build

# Prune development dependencies
RUN pnpm prune --prod

# ---- Runner Stage ----
# Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

# Set the user to 'nodejs' for better security
# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
# If you have a standalone build, you might need to copy the server.js file instead
# COPY --from=builder /app/server.js ./server.js

# Change ownership of the working directory
USER nextjs

EXPOSE 3000

ENV PORT 3000
# ENV HOSTNAME "0.0.0.0" # Required for Cloud Run

# Server.js is used to run the application in standalone mode.
# If you are not using standalone mode, use the default pnpm start command
# CMD ["node", "server.js"]
CMD ["pnpm", "start"]
