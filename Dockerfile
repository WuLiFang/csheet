
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

FROM python:3.7 AS server-build

ARG DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8
RUN set -e

ARG DEBIAN_MIRROR
RUN if [ ! -z $DEBIAN_MIRROR ]; then \
    sed -i "s@http://.\+\.debian\.org/debian@$DEBIAN_MIRROR@g" /etc/apt/sources.list \
    && cat /etc/apt/sources.list; \
    fi
RUN apt-get update &&\
    apt-get -y install ffmpeg &&\
    ffmpeg -version &&\
    apt-get clean

ARG PIP_MIRROR=https://mirrors.aliyun.com/pypi/simple/
ENV PIP_INDEX_URL=$PIP_MIRROR
ENV PYTHONIOENCODING=utf-8
RUN pip install gunicorn gevent-websocket

WORKDIR /app/
COPY ./server/requirements.txt ./server/
RUN pip install -r ./server/requirements.txt
COPY ./server/ ./server/
COPY --from=web-build /app/web/dist/ ./server/dist/
ENV PYTHONPATH=server

FROM server-build AS server-test

RUN pip install pytest

RUN pytest server

FROM server-build AS release

ENV CSHEET_SETTINGS=/etc/csheet/settings.py
ENV WORKER_CONNECTIONS=1000

RUN set +e
EXPOSE 80
LABEL author="NateScarlet@Gmail.com"
ENTRYPOINT [ "./entrypoint.sh" ]
CMD ["run"]
