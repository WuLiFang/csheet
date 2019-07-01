FROM python:3 AS build

ARG DEBIAN_FRONTEND=noninteractive
RUN set -e
ENV LANG=C.UTF-8
ENV PYTHONIOENCODING=utf-8
ARG PIP_MIRROR=https://mirrors.aliyun.com/pypi/simple
ENV PIP_INDEX_URL=$PIP_MIRROR

WORKDIR /app

COPY ./requirements.txt ./
RUN pip install -r requirements.txt

COPY ./ ./
RUN make html

FROM nginx AS release

COPY --from=build /app/_build/html/ /usr/share/nginx/html/
