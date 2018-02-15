FROM node:8@sha256:9f4efebdb42aa2c0eb752830a6ce57ff73afa7ee19b24804d32bf3e1252b4b72
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
