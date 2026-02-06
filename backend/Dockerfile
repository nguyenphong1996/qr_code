
# Use a Debian-based Node.js runtime to avoid sqlite3 segfaults on Alpine
FROM node:18-bullseye-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install build deps for sqlite3 native bindings, then install dependencies
RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 make g++ \
	&& rm -rf /var/lib/apt/lists/*

RUN npm ci --omit=dev \
	&& npm rebuild sqlite3 --build-from-source

# Copy the rest of the backend source code
COPY . .

# Expose port 3001 (Node.js server port)
EXPOSE 3001

# Define the command to run the app
CMD ["node", "server.js"]