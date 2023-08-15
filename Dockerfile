FROM node:lts-bullseye-slim

WORKDIR /bot

COPY package*.json ./

RUN npm install

COPY . .

CMD ["node", "bot.js"]