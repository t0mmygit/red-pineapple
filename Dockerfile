FROM node:lts-alpine3.21

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY src ./src

RUN npm run build

RUN npm ci --only=production

CMD ["node", "dist/index.js"]
