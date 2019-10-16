
FROM node:lts AS web-build

ARG DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8
RUN set -e
RUN ping -c 1 google.com || \
    npm i mirror-config-china --registry=https://registry.npm.taobao.org &&\
    npm config list

WORKDIR /app/web
COPY ./web/package*.json ./
RUN npm i
WORKDIR /app
COPY ./web/ ./web/
COPY ./server/csheet/templates/ ./server/csheet/templates/
ENV NODE_ENV=production
RUN make -C web

FROM python:3.8 AS server-build

ARG DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8
RUN set -e

ARG DEBIAN_MIRROR
RUN if [ ! -z $DEBIAN_MIRROR ]; then \
    sed -i "s@http://.\+\.debian\.org/debian@$DEBIAN_MIRROR@g" /etc/apt/sources.list && \
    cat /etc/apt/sources.list; \
    fi
RUN apt-get update &&\
    apt-get -y install ffmpeg &&\
    ffmpeg -version &&\
    apt-get clean

ARG PIP_MIRROR=https://mirrors.aliyun.com/pypi/simple/
ENV PIP_INDEX_URL=$PIP_MIRROR
ENV PYTHONIOENCODING=utf-8
RUN pip install gunicorn gevent-websocket

WORKDIR /app
COPY ./config ./config/
RUN if [ -f ./config/ca-certificates.crt ]; then \
    cp ./config/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt; \
    fi
COPY ./server/requirements.txt ./
RUN pip install -r requirements.txt
COPY ./server/ ./
COPY --from=web-build /app/web/dist/ ./dist/
ENV PYTHONPATH=/app

FROM server-build AS server-test

RUN pip install pytest && pytest

FROM server-build AS release

ENV CSHEET_SETTINGS=/etc/csheet/settings.py
ENV WORKER_CONNECTIONS=1000
ENV SENTRY_ENVIRONMENT=production
ARG COMMIT_SHA1
ENV COMMIT_SHA1=${COMMIT_SHA1}


RUN set +e
EXPOSE 80
LABEL author="NateScarlet@Gmail.com"
ENTRYPOINT [ "./entrypoint.sh" ]
CMD ["run"]
