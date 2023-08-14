# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code to the working directory
COPY . .

# Expose the port your bot listens on (replace 3000 with the actual port number)
EXPOSE 3000

# Run the bot
CMD [ "node", "bot.js" ]