FROM hub.hamdocker.ir/node:16 as builder
ARG NODE_OPTIONS
WORKDIR /app 
COPY package.json package-lock.json ./
RUN apt-get update
RUN apt install -y nodejs
RUN npm install 
COPY . .
RUN node ./bot.js


FROM hub.hamdocker.ir/node:16 as runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/ ./

CMD ["npm", "start"]