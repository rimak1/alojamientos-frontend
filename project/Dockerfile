# ==========================
# Etapa 1: build Angular
# ==========================
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Build prod (respeta tu angular.json con outputPath=dist/demo)
RUN npm run build -- --configuration production

# ==========================
# Etapa 2: Nginx
# ==========================
FROM nginx:alpine

# Limpia el server default y copia tu conf
RUN rm -rf /etc/nginx/conf.d/*
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Limpia html por defecto y copia el build, contemplando el caso "browser/"
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/demo /tmp/dist
RUN if [ -d /tmp/dist/browser ]; then \
      cp -r /tmp/dist/browser/* /usr/share/nginx/html/ ; \
    else \
      cp -r /tmp/dist/* /usr/share/nginx/html/ ; \
    fi

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
