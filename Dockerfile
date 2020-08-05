FROM node

COPY . .

RUN npm i && npm run build

ENTRYPOINT [ "npm", "start" ]