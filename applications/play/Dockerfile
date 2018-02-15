FROM node:8@sha256:2bc11676ad168f25e38e123672a0e5a782d148cf3b0b77328d971ed1b06e4104
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
