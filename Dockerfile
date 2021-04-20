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
COPY package*.json tsconfig.json *.config.js .graphqlconfig .npmrc .pnpmfile.cjs ./
COPY src/ src/
COPY public/ public/
RUN set -ex &&\
    npx pnpm --store-dir .pnpm_store/ i &&\
    npm run build &&\
    rm -rf .pnpm_store/ node_modules/

FROM golang:1-alpine AS server

# Example: https://goproxy.cn,direct
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
COPY cmd/ cmd/
COPY internal/ internal/
COPY pkg/ pkg/
COPY go.mod go.sum Makefile ./

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

# Not use ffmpeg package from apk repo because we need webp support
FROM jrottenberg/ffmpeg:4.3-alpine312 AS ffmpeg

FROM alpine:3.13 as release

# Example: mirrors.tuna.tsinghua.edu.cn
ARG ALPINE_MIRROR
RUN if [ -n "${ALPINE_MIRROR}" ]; then \
    sed -i "s/dl-cdn.alpinelinux.org/${ALPINE_MIRROR}/g" /etc/apk/repositories && \
    cat /etc/apk/repositories; \
    fi;

COPY --from=ffmpeg /usr/local/ /usr/local/

RUN apk add --no-cache \
        mailcap \
        libstdc++ \
        libgomp \
        expat \
    && ffmpeg -version

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
