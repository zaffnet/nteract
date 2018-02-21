FROM node:8@sha256:e54e8d37bd8c85b3f607a4978d0d50c21cba0e6a3e132651ea0f19b5dfc76203
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
