# ---- deps stage ----
FROM oven/bun:1 AS deps
WORKDIR /app

# Native addon build tools (required for better-sqlite3)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock* bun.lockb* ./
RUN bun install --frozen-lockfile

# ---- builder stage ----
FROM deps AS builder
WORKDIR /app

COPY . .
RUN bun run build

# ---- runner stage ----
FROM oven/bun:1 AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built output and runtime dependencies
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# The SQLite database lives here; mount a volume so data persists across restarts
VOLUME ["/app/.db"]

EXPOSE 3000

CMD ["bun", "run", "start"]
