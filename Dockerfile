FROM node:20-slim

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --ingroup nodejs --home /home/appuser appuser

RUN chown -R appuser:nodejs /app

USER appuser

COPY --chown=appuser:nodejs package*.json ./

# Install dependencies
RUN npm ci

# Copy app code
COPY --chown=appuser:nodejs . .

EXPOSE 8088

# Makes the Metro bundler accessible outside the container
CMD ["npx", "expo", "start", "--host", "0.0.0.0", "--port", "8088"]