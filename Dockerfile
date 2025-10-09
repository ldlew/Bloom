
FROM node:20-slim

WORKDIR /app

# Non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --ingroup nodejs --home /home/appuser appuser

RUN chown -R appuser:nodejs /app

USER appuser

# Copy package files
COPY --chown=appuser:nodejs package*.json ./

# Install dependencies
RUN npm ci

# Copy app code
COPY --chown=appuser:nodejs . .

EXPOSE 8088

CMD ["npx", "expo", "start", "--port", "8088"]