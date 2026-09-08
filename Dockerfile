FROM node:24-alpine AS build
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY src tsconfig.json ./
RUN yarn build

FROM public.ecr.aws/lambda/nodejs:24 AS dist
RUN npm install --global yarn

COPY --from=build /app/package.json /app/yarn.lock ./
RUN yarn install --production --frozen-lockfile

COPY --from=build /app/.dist .

CMD [ "index.handler" ]
