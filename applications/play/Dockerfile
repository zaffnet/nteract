FROM node:8@sha256:d97f5bf54e016ad55dd0475f8710b99be14884ab1afcae8875f8092341264b0c
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
