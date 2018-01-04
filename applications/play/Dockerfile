FROM node:8@sha256:14ce6bda461bf6785b2fef512196402f2adb7571511a4f3280058a9b2646176f
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
