FROM node:8@sha256:4c43091f426f1a630c3db3acb6f2eaf940e50eafe4d08ddc53f4d5832ba9958d
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
