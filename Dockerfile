FROM oven/bun:1.2-alpine

WORKDIR /app

# Copy dependency files
COPY package.json bun.lock bunfig.toml ./

# Install deps (use --no-frozen-lockfile since we added socket.io-client)
RUN bun install

# Copy source code (backend/ is excluded via .dockerignore)
COPY . .

# Environment
ENV HOST=0.0.0.0
ENV PORT=3000
ENV VITE_API_URL=http://localhost:3001

EXPOSE 3000

CMD ["bun", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
