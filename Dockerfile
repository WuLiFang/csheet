
FROM scratch as frontend-files

COPY frontend ./frontend/
COPY public ./public/
COPY *.js *.json ./

FROM node:10 AS frontend-build

ARG DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8
RUN set -e
ARG NPM_MIRROR=https://registry.npm.taobao.org/
RUN if [ ! -z $NPM_MIRROR ]; then \
    npm config set registry $NPM_MIRROR \
    && npm config get registry; \
    fi

WORKDIR /app
COPY ./package*.json ./
RUN npm i
COPY --from=frontend-files / ./
RUN npm run build

FROM scratch as backend-files

COPY backend ./backend/
COPY *.py *.sh *.json ./

FROM python:3.6 AS backend-prepare

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
ENV PYTHONPATH=backend

FROM backend-prepare AS backend-build

COPY --from=backend-files / ./
COPY --from=frontend-build /app/dist/ /app/dist/

FROM backend-prepare AS backend-test

RUN pip install pytest

COPY --from=backend-build /app/ /app/
RUN python -m pytest ./backend/tests

FROM backend-build AS release

ENV CSHEET_SETTINGS=/etc/csheet/settings.py
ENV WORKER_CONNECTIONS=1000

RUN set +e
EXPOSE 80
LABEL author="NateScarlet@Gmail.com"
ENTRYPOINT [ "./entrypoint.sh" ]
CMD ["run"]