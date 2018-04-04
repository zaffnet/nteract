FROM node:8@sha256:8220ea2aa37785c435b45f4d83f8f5d1ceea5cd37936c0ff9d47b4d2a23db3cc
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
