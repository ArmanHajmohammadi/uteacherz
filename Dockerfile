FROM node:lts-bullseye-slim
ARG NODE_OPTIONS
WORKDIR /bot

COPY package*.json ./

RUN npm install

COPY . .
ENV NODE_ENV production
CMD ["node", "bot.js"]