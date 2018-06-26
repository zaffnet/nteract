FROM node:8@sha256:6d6c00a85a9859339f38eeace91b1f5554e7c7cf1165d3517cff991bf798ee2f
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
