FROM scratch as root

WORKDIR /frontend
COPY src ./src/
COPY public ./public/
COPY *.js *.json ./
WORKDIR /backend
COPY lib ./lib/
COPY *.py *.sh *.json ./

FROM node:10 AS frontend-build

ARG DEBIAN_FRONTEND=noninteractive
RUN set -e

WORKDIR /app

COPY ./package*.json ./
ARG NPM_MIRROR=https://registry.npm.taobao.org/
RUN if [ ! -z $NPM_MIRROR ]; then npm config set registry $NPM_MIRROR; fi
RUN npm i

COPY --from=root /frontend ./
RUN npm run build

FROM python:3.6 AS backend-prepare

ARG DEBIAN_FRONTEND=noninteractive
RUN set -e

ARG DEBIAN_MIRROR=http://mirrors.aliyun.com/debian
RUN if [ ! -z $DEBIAN_MIRROR ]; then sed -i "s@http://.\+\.debian\.org/debian@$DEBIAN_MIRROR@g" /etc/apt/sources.list && cat /etc/apt/sources.list; fi
RUN apt-get update
RUN apt-get -y install ffmpeg && ffmpeg -version
RUN apt-get clean

ARG PIP_MIRROR=https://mirrors.aliyun.com/pypi/simple
ENV PIP_INDEX_URL=$PIP_MIRROR
RUN pip install pipenv gunicorn gevent-websocket

WORKDIR /app
COPY ./Pipfile* ./
RUN pipenv install --system --deploy
ENV PYTHONPATH=lib
ENV PYTHONIOENCODING=utf-8

FROM backend-prepare AS backend-build

COPY --from=root /backend ./
COPY --from=frontend-build /app/dist/ /app/dist/

FROM backend-prepare AS backend-test

RUN pip install pytest

COPY --from=backend-build /app/ ./
COPY tests ./tests/
RUN python -m pytest ./tests

FROM backend-build AS release

ENV LANG=C.UTF-8
ENV CSHEET_SETTINGS=/etc/csheet/settings.py
ENV WORKER_CONNECTIONS=1000

RUN set +e
LABEL author="NateScarlet@Gmail.com"
ENTRYPOINT [ "./entrypoint.sh" ]
CMD ["run"]