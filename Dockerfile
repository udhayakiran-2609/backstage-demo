FROM node:22-bookworm-slim AS build

RUN apt-get update && apt-get install -y python3 make g++ git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY packages/app/package.json ./packages/app/package.json
COPY packages/backend/package.json ./packages/backend/package.json
COPY plugins/banner-admin/package.json ./plugins/banner-admin/package.json
COPY plugins/banner-admin-backend/package.json ./plugins/banner-admin-backend/package.json
COPY plugins/feedback/package.json ./plugins/feedback/package.json
COPY plugins/feedback-backend/package.json ./plugins/feedback-backend/package.json

RUN yarn install --immutable

COPY . .

# RUN chmod +x pack-deps.sh
# RUN ./pack-deps.sh

RUN yarn workspace app build
RUN yarn workspace backend build

# --- Production ---
FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y python3 python3-pip git \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install mkdocs-techdocs-core --break-system-packages

WORKDIR /app

COPY --from=build /app/packages/backend/dist/bundle.tar.gz .
RUN tar xzf bundle.tar.gz && rm bundle.tar.gz

# COPY --from=build /app/dynamic-plugins-root ./dynamic-plugins-root

COPY --from=build /app/node_modules ./node_modules

COPY app-config.yaml .
COPY app-config.production.yaml .

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "packages/backend", "--config", "app-config.yaml", "--config", "app-config.production.yaml"]