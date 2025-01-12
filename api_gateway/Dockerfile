FROM node:latest

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 8197

CMD ["node", "index.js"]