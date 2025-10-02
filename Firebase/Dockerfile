FROM node:22

WORKDIR /app

RUN apt-get update
RUN apt-get -y install default-jre
RUN yarn global add firebase-tools
RUN firebase setup:emulators:firestore
RUN firebase setup:emulators:storage
RUN firebase setup:emulators:ui
