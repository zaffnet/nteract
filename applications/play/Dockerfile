FROM node:8@sha256:28ab0eea1772d44259687f4d540535515f64634bae5ed846a12a09d5a49456f5
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
