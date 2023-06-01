# Build setp
FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

# Production step
FROM nginx:1.24.0-alpine AS production
COPY spa.conf /etc/nginx/conf.d/default.conf
WORKDIR /app
COPY --from=build /app/dist ./