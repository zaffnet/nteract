FROM node:8@sha256:19cc0100af8c67406f70cb1c27700e9c958d3d0ee2982e2ca0563d7bb8abf319
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
