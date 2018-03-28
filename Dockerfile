FROM centos AS base

# Install commandline tools
RUN yum install -y epel-release
RUN yum update -y
RUN rpm --import http://li.nux.ro/download/nux/RPM-GPG-KEY-nux.ro
RUN rpm -Uvh http://li.nux.ro/download/nux/dextop/el7/x86_64/nux-dextop-release-0-5.el7.nux.noarch.rpm
RUN yum install -y ffmpeg && ffmpeg -version
RUN yum install -y which
RUN yum install -y gcc
RUN yum install -y python-devel

# Install pip
RUN curl https://bootstrap.pypa.io/get-pip.py | python && pip --version
ENV PIP_INDEX_URL https://mirrors.aliyun.com/pypi/simple

# Install pipenv
RUN pip install pipenv && pipenv --version

FROM base AS build

COPY . /csheet
WORKDIR /csheet

# Install dependencies
RUN pipenv install --system --deploy

# Set environment
ENV PYTHONPATH=lib
ENV LANG=en_US.utf-8

# Clean commandline tools.
RUN yum remove -y which gcc python-devel
RUN yum clean all

FROM build AS test

RUN pip install mock
RUN set -ex && python -m unittest discover -v -s ./lib/csheet/tests -p test_*.py

FROM build AS release

LABEL author="NateScarlet@Gmail.com"
CMD  ["-p", "80", "-s", "/srv/csheet"]
ENTRYPOINT ["python", "-m", "csheet"]