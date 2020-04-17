
FROM node:lts AS web

ARG DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8
RUN set -e
RUN ping -c 1 google.com || \
    npm_config_registry=http://registry.npm.taobao.org npx npm-mirror-set -g taobao &&\
    npm config list
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt
ARG NODEJS_ORG_MIRROR=http://npm.taobao.org/mirrors/node

WORKDIR /app/
COPY ./package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM golang:1 AS build

ARG DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8
RUN set -e

ARG DEBIAN_MIRROR=http://mirrors.huaweicloud.com/debian
RUN if [ ! -z $DEBIAN_MIRROR ]; then \
    sed -i "s@http://.\+\.debian\.org/debian@$DEBIAN_MIRROR@g" /etc/apt/sources.list && \
    cat /etc/apt/sources.list; \
    fi
RUN apt-get update &&\
    apt-get -y install ffmpeg &&\
    ffmpeg -version &&\
    apt-get clean
ENV TZ=Asia/Shanghai

WORKDIR /app
ENV GOPROXY=https://goproxy.cn,direct
ENV GO111MODULES=on
COPY go.mod .
COPY go.sum .
RUN go mod download
COPY . .
COPY --from=web /app/dist dist
ARG CGO_ENABLED=0
RUN go get -v ./cmd/...

FROM build as test

ARG CI=true
RUN go test ./...

FROM build as release

ENV CSHEET_ENV=production
RUN set +e
LABEL author=NateScarlet@Gmail.com
EXPOSE 80
CMD ["csheet"]
