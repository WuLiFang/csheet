
FROM scratch as web-files

COPY web ./web/
COPY public ./public/
COPY *.js *.json ./

FROM node:10 AS web-build

ARG DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8
RUN set -e
RUN ping -c 1 google.com || \
    npm i mirror-config-china --registry=https://registry.npm.taobao.org &&\
    npm config list

WORKDIR /app
COPY ./package*.json ./
RUN npm i
COPY --from=web-files / ./
ENV NODE_ENV=production
RUN npm run build

FROM scratch as server-files

COPY server ./server/
COPY *.py *.sh *.json ./

FROM python:3.7 AS server-prepare

ARG DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8
RUN set -e

ARG DEBIAN_MIRROR=http://mirrors.aliyun.com/debian
RUN if [ ! -z $DEBIAN_MIRROR ]; then \
    sed -i "s@http://.\+\.debian\.org/debian@$DEBIAN_MIRROR@g" /etc/apt/sources.list \
    && cat /etc/apt/sources.list; \
    fi
RUN apt-get update
RUN apt-get -y install ffmpeg && ffmpeg -version
RUN apt-get clean

ARG PIP_MIRROR=https://mirrors.aliyun.com/pypi/simple/
ENV PIP_INDEX_URL=$PIP_MIRROR
ENV PYTHONIOENCODING=utf-8
RUN pip install gunicorn gevent-websocket

WORKDIR /app
COPY ./requirements.txt ./
RUN pip install -r requirements.txt
ENV PYTHONPATH=server

FROM server-prepare AS server-build

COPY --from=server-files / ./
COPY --from=web-build /app/dist/ /app/dist/

FROM server-prepare AS server-test

RUN pip install pytest

COPY --from=server-build /app/ /app/
RUN python -m pytest ./server/tests

FROM server-build AS release

ENV CSHEET_SETTINGS=/etc/csheet/settings.py
ENV WORKER_CONNECTIONS=1000

RUN set +e
EXPOSE 80
LABEL author="NateScarlet@Gmail.com"
ENTRYPOINT [ "./entrypoint.sh" ]
CMD ["run"]
