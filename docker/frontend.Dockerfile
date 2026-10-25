# Vite dev server for the React frontend. Build context: repository root.
FROM node:20-alpine

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./

EXPOSE 5173

# --host so the server is reachable from outside the container.
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]
