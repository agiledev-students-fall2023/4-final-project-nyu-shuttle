# ./front-end/Dockerfile
FROM node:18.17.1
RUN mkdir -p /usr/src/app/node_modules && chown -R node:node /usr/src/app
WORKDIR /usr/src/app
COPY front-end/package*.json ./
RUN npm ci --verbose
COPY front-end/ ./
EXPOSE 3000
CMD ["npm", "start"]
