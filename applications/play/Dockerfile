FROM node:8@sha256:0c7cd8a4a90f2b25a96635d77a30b5a6a689badf47419044649d051c15d2e4b7
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
