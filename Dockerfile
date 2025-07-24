FROM node:22

WORKDIR /app

RUN corepack enable && corepack prepare yarn@stable --activate

COPY package.json .
COPY yarn.lock .

RUN yarn install --immutable
