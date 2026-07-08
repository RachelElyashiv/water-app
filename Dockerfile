FROM node:20-bookworm-slim

# כלי בנייה עבור better-sqlite3 (במקרה שאין חבילה מוכנה מראש)
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
ENV DATA_DIR=/data
EXPOSE 3000

CMD ["node", "server.js"]
