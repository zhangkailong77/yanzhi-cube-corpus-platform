FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG API_BASE_URL
ARG API_URL
ENV VITE_API_BASE_URL=${API_BASE_URL}
ENV VITE_API_URL=${API_URL}

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3002

CMD ["nginx", "-g", "daemon off;"]
