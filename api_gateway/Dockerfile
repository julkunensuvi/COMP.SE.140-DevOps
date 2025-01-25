FROM node:latest
RUN apt-get update && apt-get install -y docker.io
WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 8197

CMD ["node", "index.js"]