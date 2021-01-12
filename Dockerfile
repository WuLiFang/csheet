FROM node:lts AS web

RUN ping -c 1 google.com ||\
    npm_config_registry=http://registry.npm.taobao.org npx npm-mirror-set -g taobao &&\
    npm -g config list
ARG NODEJS_ORG_MIRROR=http://npm.taobao.org/mirrors/node

WORKDIR /app/
ARG RELEASE
ENV CSHEET_RELEASE=${RELEASE}
COPY . .
RUN set -ex\
    && npm ci\
    && npm run build\
    && rm -rf node_modules/

FROM golang:1 AS server

WORKDIR /app
ENV GOPROXY=https://goproxy.cn,direct
ENV GO111MODULES=on
COPY ./ ./
RUN set -ex \
    && go test ./...\
    && go get -v ./cmd/...\
    && go clean -cache \
    && go clean -modcache

FROM debian:stable-slim as release

ARG DEBIAN_MIRROR=http://mirrors.huaweicloud.com/debian
RUN if [ ! -z $DEBIAN_MIRROR ]; then \
    sed -i "s@http://.\+\.debian\.org/debian@$DEBIAN_MIRROR@g" /etc/apt/sources.list && \
    cat /etc/apt/sources.list; \
    fi
RUN set -ex\
    && apt-get update\
    && apt-get install -y\
        ffmpeg\
    && ffmpeg -version\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=web /app/dist dist
COPY --from=server /go/bin/* /usr/bin/

ARG RELEASE
ENV CSHEET_ENV=production
ENV CSHEET_RELEASE=${RELEASE}
ENV TZ=Asia/Shanghai

LABEL release=${RELEASE}
LABEL author=NateScarlet@Gmail.com
EXPOSE 80
CMD ["csheet"]
