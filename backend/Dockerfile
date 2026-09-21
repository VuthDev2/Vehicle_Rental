FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# The backend runs on port 5001 by default based on .env
EXPOSE 5001

CMD ["npm", "start"]
