# Builder stage
FROM hub.hamdocker.ir/node:16 as builder
ARG NODE_OPTIONS
WORKDIR /app 
COPY package.json package-lock.json ./
RUN npm install 
COPY . .
RUN npm run build

# Runner stage
FROM hub.hamdocker.ir/node:16 as runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/ ./

CMD ["npm", "start"]