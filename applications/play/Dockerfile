FROM node:8@sha256:30627901c9b8b73d51468ed66ac72c6235012b30977df237d20ac64f814aa437
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
