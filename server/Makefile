.PHONY: all

all: dist .venv/Lib/site-packages

dist: ../web/dist
	cp -r ../web/dist .

.venv/Lib/site-packages: requirements.txt dev-requirements.txt .venv
	. .venv/Scripts/activate && pip install -r requirements.txt -r dev-requirements.txt

.venv:
	virtualenv .venv
