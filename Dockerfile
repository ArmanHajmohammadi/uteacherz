# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the bot.js script to the working directory
COPY bot.js .

# Specify the command to run your bot.js script
CMD ["node", "bot.js"]