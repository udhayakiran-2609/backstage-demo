# ======================
# Build Stage
# ======================
FROM node:22-bookworm-slim AS build

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy everything first
COPY . .

# Enable Corepack
RUN corepack enable

# Install dependencies
RUN yarn install --immutable

# Build backend bundle
RUN yarn workspace backend build

# ======================
# Runtime Stage
# ======================
FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install mkdocs-techdocs-core --break-system-packages

WORKDIR /app

COPY --from=build /app/packages/backend/dist/bundle.tar.gz .

RUN tar xzf bundle.tar.gz && rm bundle.tar.gz

COPY app-config.yaml .
COPY app-config.production.yaml .

ENV NODE_ENV=production

EXPOSE 7007

CMD ["node","packages/backend","--config","app-config.yaml","--config","app-config.production.yaml"]