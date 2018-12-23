FROM node:10-alpine

RUN apk --no-cache add --virtual \
      builds-deps \
      build-base \
      python

WORKDIR /usr/src/app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "start"] # development
# CMD ["npm","run","prod"] # production