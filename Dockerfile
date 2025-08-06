FROM node:20-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app
COPY . .

# Expose the port your app uses (adjust if needed)
EXPOSE 3000

# Use npm start as the container command
CMD ["npm", "start"]
