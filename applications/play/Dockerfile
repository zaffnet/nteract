FROM node:8@sha256:0accccfd7a8e9074d44a862e06d63e69836a1f41ec77329bb3eb1dae2536a449
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
