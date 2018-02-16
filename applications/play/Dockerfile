FROM node:8@sha256:090e91ff2325ca4aa558771b7f24819825b5c8f520fb891723555bb48811f534
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
