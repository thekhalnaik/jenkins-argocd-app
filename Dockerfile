FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package.json .
RUN npm install --omit=dev

COPY app.js .

# Build-time arg so Jenkins can bake the version into the image
ARG APP_VERSION=v1.0.0
ENV APP_VERSION=${APP_VERSION}

EXPOSE 3000

CMD ["node", "app.js"]
