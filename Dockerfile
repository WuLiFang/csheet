FROM python:3 AS base

RUN apt-get install ffmpeg

RUN pip install pipenv gunicorn gevent-websocket

FROM base AS build

ENV PYTHONPATH=lib
ENV LANG=en_US.utf-8

ENV CSHEET_SETTINGS=/etc/csheet/settings.py
ENV WORKER_CONNECTIONS=1000

WORKDIR /app

COPY ./Pipfile* ./
RUN pipenv install --system --deploy

COPY . ./

FROM build AS test

RUN pip install pytest
RUN set -ex && python -m pytest ./tests

FROM build AS release

LABEL author="NateScarlet@Gmail.com"
CMD ["run"]
ENTRYPOINT [ "./entrypoint.sh" ]