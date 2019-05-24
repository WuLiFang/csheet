.PHONY: all

all: dist .venv .venv/Lib/site-packages

dist: ../web/dist
	cp -r ../web/dist .

.venv:
	virtualenv .venv

.venv/Lib/site-packages: requirements.txt dev-requirements.txt
	. .venv/Scripts/activate && pip install -r requirements.txt -r dev-requirements.txt
