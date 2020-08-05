FROM node

COPY . .

RUN npm i

ENTRYPOINT [ "npm", "start" ]