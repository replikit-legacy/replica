FROM node:alpine as build

# Restore dependencies
WORKDIR /build
COPY package.json                                      .
COPY yarn.lock                                         .
COPY modules/replica/package.json                      modules/replica/
COPY external/services/package.json                    external/services/
COPY external/services/modules/management/package.json external/services/modules/management/
COPY external/services/modules/profile/package.json    external/services/modules/profile/
RUN yarn

# Build 
COPY . .
RUN yarn build

FROM alpine

# Add nodejs
RUN apk add nodejs-current

COPY --from=build /build/dist /app

WORKDIR /app
CMD node main.js
