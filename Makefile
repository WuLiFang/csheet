

all: dist .venv

dist: node_modules web/* web/*/* web/*/*/*
	npm run build

node_modules: package.json package-lock.json
	npm install

.venv:
	virtualenv .venv

.venv/Lib/site-packages: requirements.txt dev-requirements.txt
	source .venv/Scripts/activate && pip install -r requirements.txt -r dev-requirements.txt
