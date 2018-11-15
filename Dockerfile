FROM node AS frontend-build

WORKDIR /app

COPY ./package*.json ./
RUN npm i

COPY . ./
RUN npm run build

FROM python:3 AS backend-build

RUN apt-get update
RUN apt-get -y install ffmpeg && ffmpeg -version

RUN pip install pipenv gunicorn gevent-websocket

ENV PYTHONPATH=lib
ENV LANG=en_US.utf-8

ENV CSHEET_SETTINGS=/etc/csheet/settings.py
ENV WORKER_CONNECTIONS=1000

WORKDIR /app

COPY ./Pipfile* ./
RUN pipenv install --system --deploy

COPY . ./
COPY --from=frontend-build ./dist ./

FROM backend-build AS backend-test

RUN pip install pytest
RUN set -ex && python -m pytest ./tests

FROM backend-build AS release

LABEL author="NateScarlet@Gmail.com"
CMD ["run"]
ENTRYPOINT [ "./entrypoint.sh" ]