FROM node:alpine AS builder

WORKDIR /app
COPY ./ /app
RUN yarn install --frozen-lockfile && yarn dist

FROM caddy:latest
WORKDIR /srv
COPY --from=builder /app/dist .

CMD ["caddy", "file-server", "--root", "/srv"]
