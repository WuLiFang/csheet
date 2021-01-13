FROM node:lts AS web

# Mirror name, example: taobao
ARG NPM_MIRROR
# For node-gyp, example: http://npm.taobao.org/mirrors/node
ARG NODEJS_ORG_MIRROR
# For npx run, example: http://registry.npm.taobao.org
ARG npm_config_registry
RUN if [ -n "${NPM_MIRROR}" ]; then \
        npx npm-mirror-set -g ${NPM_MIRROR} \
        && npm -g config list \
    ; fi

WORKDIR /app/
ARG RELEASE
ENV CSHEET_RELEASE=${RELEASE}
COPY . .
RUN set -ex\
    && npm ci\
    && npm run build\
    && rm -rf node_modules/

FROM golang:1-alpine AS server

ARG GOPROXY
ENV GOPROXY=${GOPROXY}
ENV GO111MODULES=on

# Example: mirrors.tuna.tsinghua.edu.cn
ARG ALPINE_MIRROR
RUN if [ -n "${ALPINE_MIRROR}" ]; then \
    sed -i "s/dl-cdn.alpinelinux.org/${ALPINE_MIRROR}/g" /etc/apk/repositories && \
    cat /etc/apk/repositories; \
    fi;

WORKDIR /app
COPY ./ ./
RUN set -ex \
    && apk add --no-cache --virtual .build-deps \
        gcc \
        musl-dev \
        make \
        mailcap \
    && make test \
    && make install \
    && apk del .build-deps \
    && go clean -cache \
    && go clean -modcache

FROM alpine:3 as release

# Example: mirrors.tuna.tsinghua.edu.cn
ARG ALPINE_MIRROR
RUN if [ -n "${ALPINE_MIRROR}" ]; then \
    sed -i "s/dl-cdn.alpinelinux.org/${ALPINE_MIRROR}/g" /etc/apk/repositories && \
    cat /etc/apk/repositories; \
    fi;

RUN apk add --no-cache ffmpeg mailcap

WORKDIR /app
COPY --from=web /app/dist/ dist/
COPY --from=server /go/bin/ /usr/local/bin/

ARG RELEASE
ENV CSHEET_ENV=production
ENV CSHEET_RELEASE=${RELEASE}

LABEL release=${RELEASE}
LABEL author=NateScarlet@Gmail.com
EXPOSE 80
CMD ["csheet"]
