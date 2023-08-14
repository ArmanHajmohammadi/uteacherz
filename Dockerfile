FROM hub.hamdocker.ir/node:16 as builder
ARG NODE_OPTIONS
WORKDIR /uteacherzbot
COPY package.json package-lock.json ./
RUN npm install 
COPY . .
RUN npm run build


FROM hub.hamdocker.ir/node:16 as runner
WORKDIR /uteacherzbot
ENV NODE_ENV production
COPY --from=builder /uteacherzbot/ ./

CMD ["npm", "start"]