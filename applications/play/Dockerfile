FROM node:8@sha256:8fb7c65f833f0630f1a4abe484e05b705036d50932222b9c1837efc08ba8c22d
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
