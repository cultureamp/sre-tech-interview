FROM node:16-alpine as build
WORKDIR /app

COPY package.json yarn.lock .
RUN yarn install

COPY src tsconfig.json .
RUN yarn build

FROM node:16-alpine as dist
WORKDIR /app

COPY --from=build /app/.dist .dist
COPY --from=build /app/package.json /app/yarn.lock .
RUN yarn install --production --frozen-lockfile
