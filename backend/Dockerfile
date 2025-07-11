# backend/Dockerfile
FROM node

# Set working directory
WORKDIR /app

# Copy only package.json to install dependencies first
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy all backend files
COPY . .

# Expose port for Express
EXPOSE 8080

# Start the backend server
CMD ["node", "server.js"]
