FROM centos

LABEL author="NateScarlet@Gmail.com"

COPY . /csheet
RUN ls /csheet

ENV LANG=en_US.utf-8
ENV LC_TIME=zh_CN

RUN python --version
RUN curl https://bootstrap.pypa.io/get-pip.py | python

WORKDIR /csheet
ENV PYTHONPATH=lib:lib/wlf/site-packages

RUN pip --version
RUN pip install pipenv
RUN pipenv --version
RUN pipenv install --system
# RUN python -m unittest discover -v -s ./lib/csheet/tests -p test_*.py

ENTRYPOINT ["python", "-m", "csheet", "-p", "80"]