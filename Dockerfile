FROM node AS frontend-build

ARG DEBIAN_FRONTEND=noninteractive

WORKDIR /app

COPY ./package*.json ./
RUN npm i

COPY . ./
RUN npm run build

FROM python:3 AS backend-build

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update
RUN apt-get -y install ffmpeg && ffmpeg -version
RUN apt-get clean

RUN pip install pipenv gunicorn gevent-websocket

ENV PYTHONPATH=lib
ENV LANG=en_US.utf-8

ENV CSHEET_SETTINGS=/etc/csheet/settings.py
ENV WORKER_CONNECTIONS=1000

WORKDIR /app

COPY ./Pipfile* ./
RUN pipenv install --system --deploy

COPY . ./
COPY --from=frontend-build /app/dist ./

FROM backend-build AS backend-test

RUN pip install pytest
RUN set -ex && python -m pytest ./tests

FROM backend-build AS release

LABEL author="NateScarlet@Gmail.com"
CMD ["run"]
ENTRYPOINT [ "./entrypoint.sh" ]