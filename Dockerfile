
# Build Stage
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./

# Install dependencies (verbose to see errors)
RUN npm install --verbose

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# Production Stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Permissions
RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /tmp/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /tmp/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx
EXPOSE 8080

CMD ["/bin/sh", "-c", "sed -i 's/${PORT}/'\"$PORT\"'/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
