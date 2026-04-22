# Stage: build assets
FROM ghcr.io/ministryofjustice/hmpps-node:24-alpine AS build

# Install build dependencies for native modules (canvas)
RUN apk add --no-cache \
    python3 \
    build-base \
    cairo-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    pkgconf

COPY package*.json .allowed-scripts.mjs .npmrc ./
RUN CYPRESS_INSTALL_BINARY=0 NPM_CONFIG_AUDIT=false NPM_CONFIG_FUND=false npm run setup

COPY . .
RUN npm run build && \
    npm prune --no-audit --no-fund --omit=dev

# Stage: production image
FROM ghcr.io/ministryofjustice/hmpps-node:24-alpine

ARG BUILD_NUMBER
ARG GIT_REF
ARG GIT_BRANCH

# Validate required build args and set as env variables for runtime health/info
RUN test -n "$BUILD_NUMBER" || (echo "BUILD_NUMBER not set" && false) && \
    test -n "$GIT_REF" || (echo "GIT_REF not set" && false) && \
    test -n "$GIT_BRANCH" || (echo "GIT_BRANCH not set" && false)

ENV BUILD_NUMBER=${BUILD_NUMBER} \
    GIT_REF=${GIT_REF} \
    GIT_BRANCH=${GIT_BRANCH} \
    NODE_ENV='production'

# Install runtime dependencies for canvas
RUN apk add --no-cache \
    cairo \
    pango \
    giflib \
    libjpeg-turbo \
    freetype

# Copy application files
COPY --from=build --chown=appuser:appgroup \
    /app/package.json \
    /app/package-lock.json \
    /app/liberation_sans.ttf \
    /app/liberation_sans_bold.ttf \
    ./

COPY --from=build --chown=appuser:appgroup /app/assets ./assets
COPY --from=build --chown=appuser:appgroup /app/dist ./dist
COPY --from=build --chown=appuser:appgroup /app/node_modules ./node_modules

# Create a directory to be used for temporary file uploads (ephemeral)
RUN mkdir uploads && chown appuser:appgroup uploads && chmod 775 uploads

EXPOSE 3000
USER 2000

CMD [ "npm", "start" ]
