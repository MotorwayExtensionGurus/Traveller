FROM node:16-alpine
WORKDIR /opt/traveller/
COPY ./ ./
RUN npm i
CMD npm start
