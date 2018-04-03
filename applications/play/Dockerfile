FROM node:8@sha256:9657809c879d6f5064904c4f03fff3cb1b644f659a93ed798d31bd6a1e268c19
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
