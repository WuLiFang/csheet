FROM centos AS base

# Install pip
RUN curl https://bootstrap.pypa.io/get-pip.py | python && pip --version

# Install pipenv
RUN pip install pipenv && pipenv --version

# Install commandline tools
RUN yum install -y epel-release
RUN yum update -y
RUN rpm --import http://li.nux.ro/download/nux/RPM-GPG-KEY-nux.ro
RUN rpm -Uvh http://li.nux.ro/download/nux/dextop/el7/x86_64/nux-dextop-release-0-5.el7.nux.noarch.rpm
RUN yum install -y ffmpeg && ffmpeg -version
RUN yum install -y which

FROM base AS build

COPY . /csheet
WORKDIR /csheet

# Install dependencies
RUN pipenv install --system --deploy

# Set environment
ENV PYTHONPATH=lib:lib/wlf/site-packages
ENV LANG=en_US.utf-8

FROM build AS test

RUN pip install mock
RUN set -ex && python -m unittest discover -v -s ./lib/csheet/tests -p test_*.py
RUN set -ex && python -m unittest discover -v -s ./lib/wlf/tests -p test_*.py

FROM build AS release

LABEL author="NateScarlet@Gmail.com"
CMD  ["-p", "80", "-s", "/srv/csheet"]
ENTRYPOINT ["python", "-m", "csheet"]