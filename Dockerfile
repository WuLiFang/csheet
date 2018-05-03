FROM jrottenberg/ffmpeg:centos AS base

RUN yum -y install which gcc python-devel && \
    yum clean all;

ENV PIP_INDEX_URL https://mirrors.aliyun.com/pypi/simple
RUN curl https://bootstrap.pypa.io/get-pip.py | python && pip install --upgrade pip
RUN pip install pipenv gunicorn gevent-websocket

FROM base AS build

ENV PYTHONPATH=lib
ENV LANG=en_US.utf-8

LABEL author="NateScarlet@Gmail.com"
ENV CSHEET_STORAGE=/srv/csheet
ENV CSHEET_DATABASE=sqlite:////var/db/csheet.db
ENV WORKER_CONNECTIONS=1000

COPY . /csheet
WORKDIR /csheet

RUN pipenv install --system --deploy

FROM build AS test

RUN pip install pytest
RUN set -ex && python -m pytest ./tests

FROM build AS release

CMD ["run"]
ENTRYPOINT [ "./entrypoint.sh" ]