FROM node:8@sha256:c55f3e9a7a2b9194e8c8c6b68b182caac02d0f6a77aacba1ebd73f6001a1c381
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
