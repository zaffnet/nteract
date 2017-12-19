FROM node:8.9.3@sha256:7c8290a50527205b67f1ef743285d827eba2b3a726f4dedbd166175c7a39ed05
ADD . /nteract
WORKDIR /nteract
RUN npm i
# RUN npm run dist:linux64
