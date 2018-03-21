FROM centos

LABEL author="NateScarlet@Gmail.com"

ENV LANG=en_US.utf-8
ENV LC_TIME=zh_CN

# Install pip
RUN python --version
RUN curl https://bootstrap.pypa.io/get-pip.py | python

# Install pipenv
RUN pip --version
RUN pip install pipenv
RUN pipenv --version

# Install ffmpeg
RUN yum install -y epel-release
RUN yum update -y
RUN rpm --import http://li.nux.ro/download/nux/RPM-GPG-KEY-nux.ro
RUN rpm -Uvh http://li.nux.ro/download/nux/dextop/el7/x86_64/nux-dextop-release-0-5.el7.nux.noarch.rpm
RUN yum install -y ffmpeg

# Install dependencies.

COPY . /csheet
WORKDIR /csheet
RUN ls
RUN pipenv install --system
ENV PYTHONPATH=lib:lib/wlf/site-packages

# Tests
RUN python -m unittest discover -v -s ./lib/csheet/tests -p test_*.py

ENTRYPOINT ["python", "-m", "csheet", "-p", "80"]