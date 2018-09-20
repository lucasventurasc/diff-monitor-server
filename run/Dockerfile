FROM node:10.9.0-alpine

ADD . /tmp/
RUN cd /tmp/ && npm install . && ./node_modules/.bin/tsc
RUN mkdir /server/ &&               \
    cp -R /tmp/build /server/ &&     \
    cp -R /tmp/views /server/ &&      \
    cp -R /tmp/node_modules /server/
RUN rm /tmp/ -rf
WORKDIR /server/

CMD ["sh", "-c", "node /server/build/Application.js"]
