FROM node:20-alpine

WORKDIR /app

# Copy dependency files and install
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Compile TypeScript to runnable JavaScript
RUN npm run build

# Create data directory for JSON store persistence
RUN mkdir -p /app/data

ENV PORT=3001
ENV HOST=0.0.0.0
ENV DB_PATH=./data/voltaire.db
ENV CORS_ORIGIN=http://localhost:3000,http://frontend:3000
ENV SIMULATOR_INTERVAL_MS=5000

EXPOSE 3001

CMD ["npm", "start"]
