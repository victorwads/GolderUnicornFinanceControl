FROM node:24-alpine

WORKDIR /app

RUN apk add openjdk21-jre
ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk
ENV PATH="${JAVA_HOME}/bin:${PATH}"

RUN yarn global add firebase-tools
RUN firebase setup:emulators:firestore
RUN firebase setup:emulators:storage
RUN firebase setup:emulators:ui
