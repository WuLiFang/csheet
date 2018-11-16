FROM node AS frontend-build

ARG DEBIAN_FRONTEND=noninteractive

WORKDIR /app

COPY ./package*.json ./
RUN npm i

COPY . ./
RUN npm run build

FROM python:3 AS backend-prepare

ARG DEBIAN_FRONTEND=noninteractive

RUN sed -i "s@http://.\+\.debian\.org@http://mirrors.aliyun.com@g" /etc/apt/sources.list && cat /etc/apt/sources.list
RUN apt-get update
RUN apt-get -y install ffmpeg && ffmpeg -version
RUN apt-get clean

ENV PIP_INDEX_URL=https://mirrors.aliyun.com/pypi/simple
RUN pip install pipenv gunicorn gevent-websocket

WORKDIR /app
COPY ./Pipfile* ./
RUN pipenv install --system --deploy
ENV PYTHONPATH=lib

FROM backend-prepare AS backend-build

COPY . ./
COPY --from=frontend-build /app/dist/ /app/dist/

FROM backend-prepare AS backend-test

RUN pip install pytest

COPY --from=backend-build /app/ ./
RUN set -ex && python -m pytest ./tests

FROM backend-build AS release

ENV LANG=en_US.utf-8
ENV CSHEET_SETTINGS=/etc/csheet/settings.py
ENV WORKER_CONNECTIONS=1000

LABEL author="NateScarlet@Gmail.com"

ENTRYPOINT [ "./entrypoint.sh" ]
CMD ["run"]