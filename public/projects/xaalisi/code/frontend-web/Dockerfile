FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
# We use VITE_API_URL=/api to proxy backend requests when served via the main Nginx
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Use a lightweight Nginx to serve the static files internally
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config to support React Router and cache control
RUN echo "server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
    location ~* \.(css|js|png|jpg|jpeg|gif|ico)$ { \
        root /usr/share/nginx/html; \
        try_files \$uri =404; \
        expires 1y; \
        access_log off; \
        add_header Cache-Control \"public\"; \
    } \
    location = /index.html { \
        root /usr/share/nginx/html; \
        add_header Cache-Control \"no-store, no-cache, must-revalidate\"; \
    } \
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
