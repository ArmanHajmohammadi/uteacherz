# Builder stage
FROM hub.hamdocker.ir/node:16 as builder
ARG NODE_OPTIONS
WORKDIR /app 
COPY package.json package-lock.json ./
RUN npm install 
COPY . .
# Install SQLite3 library and tools
RUN apt-get update && apt-get install -y sqlite3
RUN npm run build


# Set the environment variable for SQLite3
ENV SQLITE_DB_PATH="/app/Data/uteacherz.db"

# Expose the required port for the bot
EXPOSE 3000

# Runner stage
FROM hub.hamdocker.ir/node:16 as runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/ ./

# Start the bot application
CMD [ "node", "bot.js" ]