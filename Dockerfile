FROM node:lts-alpine AS builder

WORKDIR /app
COPY ./ /app
RUN yarn install --immutable 
RUN yarn build

FROM caddy:latest
WORKDIR /srv
COPY --from=builder /app/dist .

CMD ["caddy", "file-server", "--root", "/srv"]
